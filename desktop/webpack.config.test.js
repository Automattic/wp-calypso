/**
 * External Dependencies
 */
var path = require( 'path' );

/**
 * Internal dependencies
 */
var shared = require( './webpack.shared' );

var options = {
	entry: './desktop/test/boot.js',
	output: {
		path: path.join( __dirname, 'build' ),
		filename: 'desktop-test.js',
		libraryTarget: 'commonjs2'
	}
};

module.exports = Object.assign( shared, options );
