var pkg = require( '../../package.json' );
var config = require( '../build-config/build.json' );

// Merge in some details from package.json
config.version = pkg.version;

module.exports = config;
