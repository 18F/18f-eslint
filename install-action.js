#!/usr/bin/env node
const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");

// Allow console.log here, since it's a CLI application.
/* eslint-disable no-console */

const getGitRoot = () =>
  new Promise((resolve) => {
    childProcess.exec("git rev-parse --show-toplevel", (_, stdout) => {
      resolve(`${stdout}`.trim());
    });
  });

const mkdir = (dir) =>
  new Promise((resolve, reject) => {
    fs.mkdir(dir, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

const getWorkflowFile = async () => {
  const root = await getGitRoot();
  const gh = path.join(root, ".github");
  const wf = path.join(gh, "workflows");
  const ym = path.join(wf, "18f-eslint.yml");

  return new Promise((resolve, reject) => {
    fs.access(gh, async (ghErr) => {
      if (ghErr && ghErr.code === "ENOENT") {
        await mkdir(gh);
      }

      fs.access(wf, async (wfErr) => {
        if (wfErr && wfErr.code === "ENOENT") {
          await mkdir(wf);
        }

        fs.access(ym, async (ymErr) => {
          if (!ymErr) {
            return reject(
              new Error("You already have an 18F-eslint workflow defined")
            );
          }

          return resolve(ym);
        });
      });
    });
  });
};

const findPackageFiles = (dir) =>
  new Promise((resolve) => {
    fs.readdir(dir, { withFileTypes: true }, async (_, files) => {
      if (files.some((file) => file.name === "package.json")) {
        return resolve([dir]);
      }

      const dirs = files
        .filter((file) => file.isDirectory())
        .map((subdir) => subdir.name)
        .filter((subdir) => subdir !== "node_modules" && subdir !== ".git")
        .map((subdir) => path.join(dir, subdir));

      const packages = await Promise.all(
        dirs.map(findPackageFiles).filter((subdir) => subdir !== null)
      );
      if (packages.length === 0) {
        return resolve();
      }

      const r = packages
        .filter((pkg) => !!pkg && pkg.length > 0)
        .map((pkgs) => pkgs[0]);
      return resolve(r);
    });
  });

const writeWorkflow = async (paths) => {
  const workflowPath = await getWorkflowFile();

  const workflow = `name: lint action

on: [pull_request]

jobs:
  lint:
    name: 18F ESLint
    runs-on: ubuntu-latest
    container: node:14
    steps:
      - uses: actions/checkout@af513c7a
${paths
  .map(
    (dir) => `      - uses: 18f/18f-eslint-action@v1.1.0
        with:
          lint-glob: "**/*.js"
          working-directory: ${dir}`
  )
  .join("\n")}
`;
  fs.writeFile(workflowPath, workflow, { encoding: "utf-8" }, (err) => {
    if (err) {
      return Promise.reject(err);
    }
    return Promise.resolve();
  });
};

const run = async () => {
  try {
    await getWorkflowFile();
  } catch (e) {
    console.log(e.message);
    return;
  }

  const root = await getGitRoot();
  const packageDirs = await findPackageFiles(root);
  const packageRelativeDirs = packageDirs.map((dir) => dir.replace(root, "."));
  writeWorkflow(packageRelativeDirs);
};

run();
