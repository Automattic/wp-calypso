// Filter by "group", which really means filename prefix, i.e:
//
//  --group=test/groupname
//  --group=test/abc/xyz/Regression
//  --group=test/abc/xyz/Smoke
//
module.exports = function(files, partialFilename) {
  console.log("Using group filter: ", partialFilename);

  return files.filter(function(f) {
    var pass = true;

    if (partialFilename) {
      if (typeof partialFilename === "string") {
        partialFilename = [partialFilename];
      }
      pass = partialFilename.some(function(pfn) {
        return f.indexOf(pfn) > -1;
      });
    }

    return (f.indexOf(".js") === f.length - 3) && pass;
  }).map(function(f) {
    return f.trim();
  });
};