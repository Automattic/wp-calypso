var _ = require("lodash");
var acorn = require("acorn");
var walk = require("acorn/dist/walk");
var path = require("path");
var fs = require("fs");

var mochaSettings = require("./mocha_settings");

var sourceFolders = mochaSettings.mochaTestFolders;

var Path = function (path, filename) {
  this.path = path;
  this.filename = filename;
};

Path.prototype.toString = function () {
  return this.path;
};

module.exports = function () {

  // Gather up a list of files in each source folder
  var allFiles = [];
  sourceFolders.forEach(function (folder) {
    // This folder is actually a file
    if (folder.split(".").pop() === "js") {
      allFiles.push(folder);
    } else {
      var files = fs.readdirSync(path.resolve(folder));
      if (files.length > 0) {
        allFiles = allFiles.concat(files.map(function (f) {
          return path.resolve(folder) + "/" + f;
        }));
      }
    }
  });

  // Ensure we scan for JS only, ignoring README files, etc.
  allFiles = allFiles.filter(function (f) {
    return (f.indexOf(".js") === f.length - 3);
  }).map(function (f) {
    return f.trim();
  });


  // Scan each file for calls to it("....");
  var tests = allFiles.map(function (filename) {
    filename = path.resolve(filename);
    var root = acorn.parse(fs.readFileSync(path.resolve(filename)), {
      ecmaVersion: 6
    });
    var children = [];

    // walk all nodes in JS syntax tree, hunt for CallExpressions of the form it("..");
    walk.findNodeAt(root, null, null, function (nodeType, node) {
      if (nodeType === "CallExpression" && node.callee.name === "it") {
        var name = node.arguments[0].value;
        children.push(new Path(name, filename));
      }
    });
    return children;
  });

  return _.flatten(tests);
};