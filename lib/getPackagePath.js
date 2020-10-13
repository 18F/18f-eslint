const fs = require("fs");
const path = require("path");

module.exports = () => {
  // Start at the current path. We'll walk backwards from here.
  const packagePath = ["."];
  let lastPath = path.resolve("./");

  try {
    // Keep drilling down while the path still doesn't include package.json
    while (!fs.readdirSync(packagePath.join("/")).includes("package.json")) {
      // Insert a ".." at the front of the path
      packagePath.unshift("..");

      const newPath = path.resolve(packagePath.join("/"));

      // If the last path we looked at is the same as the next path we're going
      // to look at, we can bail out because we've reached the top of the
      // directory tree. Weirdly, Node.js is happy to let you keep adding ".."s
      // forever, until the path length just gets too long. So, we should add
      // a short-circuit for that.
      if (newPath === lastPath) {
        throw new Error("cannot go further up the directory tree");
      }
      lastPath = newPath;
    }
  } catch (e) {
    // If we can't find a package.json in the current working directory or
    // anywhere further up the directory tree, just bail out altogether.
    console.log(`Could not find package.json: ${e.message}`); // eslint-disable-line no-console
    process.exit(1);
  }

  // Otherwise, return the path to the package.json file.
  return path.resolve(packagePath.join("/"), "package.json");
};
