// Filter by one exact relative filename match, eg:
// --test=path/to/exact/test/filename.js
module.exports = function(files, filename) {
  console.log("Using mocha test filter: ", filename);

  return files.filter(function(f) {
    if (f.path === filename) {
      return true;
    }
  });
};