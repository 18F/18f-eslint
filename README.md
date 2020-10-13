# 18F eslint

This app wraps the [eslint configuration described in the TTS engineering practices guide](https://engineering.18f.gov/javascript/style/),
to make it easier to get started. To use, first install:

```shell
npm install @18f/eslint
```

This will install all the appropriate base configurations and plugins. (Since
eslint 6, installing these in your local project is recommended, even if you're
using a globally-installed eslint or running with `npx`.)

To run the 18F-configured eslint on your application, you can either use `npx`,
or add it as a script to your `package.json`. By default, it will lint all
files supported by eslint starting at the current directory, but you can also
specify paths to lint in the command line arguments:

```shell
# Lint all the things
npx @18f/18f-eslint

# Lint some of the things
npx @18f/18f-eslint src
```

Or in `package.json`:

```json
{
  ...
  "scripts": {
    "lint": "18f-eslint"
  }
}
```

Once the script is defined, you can run it with `npm run lint`.

The command line arguments are passed to the [eslint `lintFiles` method](https://eslint.org/docs/developer-guide/nodejs-api#-eslintlintfilespatterns).
They can be a combination of file names, directory names, or glob patterns. Note
that if you're using globs, they should be wrapped in quotes so that they are
not evaluated by the shell.

## Configuration

By default, your application will be configured to extend the `airbnb` and
`prettier` base configurations. It will also enable the `es6` environment. If
your project uses React, it will also extend the `prettier/react` configuration
and enable the `browser` environment; otherwise, it will enable the `node`
environment.

All of these configurations can be overridden or extended by your local
`.eslintrc.*` file. The configuration provided by this library is presented to
eslint as a base, and your local, project-level configurations will supercede
it. By default, it's probably safest not to define an `env` or `extends`
property in your own config file, but you certainly can if necessary.

### Public domain

This project is in the worldwide [public domain](LICENSE.md). As stated in
[CONTRIBUTING](CONTRIBUTING.md):

> This project is in the public domain within the United States, and copyright
> and related rights in the work worldwide are waived through the
> [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).
>
> All contributions to this project will be released under the CC0 dedication.
> By submitting a pull request, you are agreeing to comply with this waiver of
> copyright interest.
