var _ = require("lodash");

module.exports = function(tests, tags) {
  // Tidy up tag input. If we have a comma-delimited list, tokenize and clean it up
  if (typeof tags === "string") {
    tags = tags.split(',').map(_.method('trim'));
  }

  // If tags are empty or malformed, ignore them
  if (!_.isArray(tags) || tags.length === 0) {
    console.log("Mocha tag filter input tags are empty, returning all tests.");
    return tests;
  }

  console.log("Using mocha tag filter with tags: ", tags);
  return tests.filter(function(test) {
    return tags.every(function(wantedTag) {
      return test.name.indexOf('@' + wantedTag) > -1;
    })
  });
};
