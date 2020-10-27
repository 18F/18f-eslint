#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const hasReact = require("./lib/hasReact");

const npx = /\/_npx\//.test(process.env.npm_config_globalconfig);
if (npx || process.env.CI) {
  process.exit(0);
}

const pathRoot = process.env.INIT_CWD || path.resolve("../../", __dirname);

const eslintPath = path.join(pathRoot, ".eslintrc.json");
const packagePath = path.join(pathRoot, "package.json");

fs.readFile(eslintPath, { encoding: "utf-8" }, (rcErr, rcData) => {
  if (rcErr) {
    if (rcErr.code !== "ENOENT") {
      throw rcErr;
    }
  }

  const rc = rcData ? JSON.parse(rcData) : {};
  const react = hasReact();

  if (!rc.extends) {
    rc.extends = [];
  }

  const config = {
    ...rc,
    env: {
      es6: true,
      [react ? "browser" : "node"]: true,
      ...rc.env,
    },
    extends: Array.from(
      new Set(
        [
          react ? "airbnb" : "airbnb-base",
          "prettier",
          react ? "prettier/react" : false,
          ...rc.extends,
        ].filter((extend) => extend !== false)
      )
    ),
  };

  fs.writeFile(
    eslintPath,
    JSON.stringify(config, null, 2),
    {
      encoding: "utf-8",
    },
    (err) => {
      if (err) {
        throw err;
      }
    }
  );

  fs.readFile(packagePath, { encoding: "utf-8" }, (pkgErr, pkgData) => {
    if (pkgErr) {
      throw pkgErr;
    }

    const packageJson = JSON.parse(pkgData);
    const newPackage = {
      ...packageJson,
      prettier: {
        ...packageJson.prettier,
      },
    };

    fs.writeFile(
      packagePath,
      JSON.stringify(newPackage, null, 2),
      {
        encoding: "utf-8",
      },
      (err) => {
        if (err) {
          throw err;
        }
      }
    );
  });
});
