
/**
 * WPCONN module
 */

var WPCONN = require('../');

/**
 * Package
 */

var pkg = require('../package.json');

/**
 * Start tests
 */

describe('version', function(){
  it('should have x.x.x format', function(){
    pkg.version.should.match(/\d\.\d\.\d/);
  });
});
