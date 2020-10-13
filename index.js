#!/usr/bin/env node
const { ESLint } = require("eslint");
const hasReact = require("./lib/hasReact");

// Allow console.log here, since it's a CLI application.
/* eslint-disable no-console */

// This separate runner function exists solely so we can have async/await
// behavior. Node.js still doesn't have top-level await and wrapping all of this
// in Promise.then()s is clunkier. So... this is what we got.
const run = async (lintPaths) => {
  const react = hasReact();

  // Setup the base configuration. All of this can be overridden by the
  // project's local .eslintrc.* config, but these are decent defaults.
  const baseConfig = {
    env: {
      es6: true,
      [react ? "browser" : "node"]: true,
    },
    extends: [
      react ? "airbnb" : "airbnb-base",
      "prettier",
      react ? "prettier/react" : false,
    ].filter((extend) => extend !== false),
  };

  try {
    const eslint = new ESLint({ baseConfig });
    const results = await eslint.lintFiles(lintPaths);
    const formatter = await eslint.loadFormatter("stylish");
    const resultText = formatter.format(results);
    console.log(resultText);
  } catch (e) {
    // If the eslint base configs and/or plugins are not installed locally in
    // the project being linted, the constructor above will throw an exception.
    // Since that seems like the sort of thing people are likely to run into,
    // special-case it so we can tell them how to fix it.
    // (E.g., you might get here by running "npx @18f/eslint" without installing
    // it locally first, which would be very tempting, no doubt.)
    if (/^Failed to load config "[^"]+" to extend from\./.test(e.message)) {
      console.log(`
It looks like some eslint configurations are not installed. Did you remember
to install @18f/eslint locally? Since version 6, eslint has strongly
recommended installing base configurations and plugins locally, even when
using a globally-installed eslint instance.`);
      console.log();
    }

    // In any case, re-throw the error so that the whole thing shows up in the
    // console, so someone can debug it.
    throw e;
  }
};

// 0 is node, 1 is script path, 2+ are args. We'll use those as linting paths.
const [, , ...paths] = process.argv;
run(paths.length > 0 ? paths : ["**/*.js"]);
