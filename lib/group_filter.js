// Filter by "group", which really means filename prefix, i.e:
//
//  --group=test/groupname
//  --group=test/abc/xyz/Regression
//  --group=test/abc/xyz/Smoke
//
var path = require('path');

module.exports = function(tests, partialFilename) {
  if (!partialFilename) {
    console.log('No partial filename supplied to group filter, using all tests');
    return tests;
  }

  if (typeof partialFilename === 'string') {
    partialFilename = [partialFilename];
  }

  console.log("Using group filter: ", partialFilename);
  return tests.filter(function(t) {
    return path.extname(t.filename) === '.js';
  }).filter(function(t) {
    return partialFilename.some(function(pfn) {
      return t.filename.indexOf(pfn) !== -1;
    });
  });
};
