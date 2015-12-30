var path = require("path"),
  fs = require("fs"),
  _ = require("lodash"),
  acorn = require("acorn"),
  clc = require("cli-color"),
  walk = require("acorn/dist/walk");

module.exports = function(tags, f) {
  // Filter by tag (or tag list):
  //
  // Parse the syntax tree of each included test and search for it() calls
  // which have description strings containing the @tag we're looking for.
  // Example:
  //
  //  it("should function correctly @basic")
  //
  // Match each f in files against the tag list we have in the array tags.
  //
  var foundTags = false;
  var pass = false;
  var filename = path.resolve(f.filename);
  var root;
  try {
    root = acorn.parse(fs.readFileSync(filename), {
      ecmaVersion: 6
    });
  } catch (err) {
    console.log(clc.redBright("Syntax error in parsing " + filename));
    throw err;
  }

  walk.findNodeAt(root, null, null, function (nodeType, node) {
    if (!pass && nodeType === "CallExpression" && node.callee.name === "it" && node.arguments[0].value === f.path) {
      var name = node.arguments[0].value;
      var matchedTags = 0;
      var nodeTags = name.split(" ");

      // check if each of tags exists in this test case
      if (tags.every(function (wantedTag) {
        return nodeTags.indexOf("@" + wantedTag) > -1;
      })) {
        pass = true;
      }
    }
  });

  return pass;
};