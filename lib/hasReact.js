const fs = require("fs");
const getPackagePath = require("./getPackagePath");

// Read the nearest package.json and see if it has React in its dependencies
// or dev dependencies. If it does, we should assume this is a React app.
module.exports = () => {
  const packagePath = getPackagePath();
  const packageContents = JSON.parse(
    fs.readFileSync(packagePath, { encoding: "utf-8" })
  );
  const hasReact =
    Object.keys(packageContents.dependencies || {}).includes("react") ||
    Object.keys(packageContents.devDependencies || {}).includes("react");

  return hasReact;
};
