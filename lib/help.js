module.exports = {
  tags: {
    example: "tag1,tag2",
    description: "Run all tests that match a list of comma-delimited tags (eg: tag1,tag2)"
  },
  group: {
    example: "prefix/path",
    description: "Run all tests that match a path prefix like ./tests/smoke"
  },
  test: {
    example: "path/to/test.js",
    description: "Run one test with a path like ./tests/smoke/test2.js"
  },
  nightwatch_config: {
    example: "path",
    description: "Specify nightwatch.json location (magellan-nightwatch)"
  }
};