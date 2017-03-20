/**
 * External Dependencies
 */
var path = require( 'path' );

/**
 * Internal dependencies
 */
var shared = require( './webpack.shared' );

var options = {
	entry: './desktop/index.js',
	output: {
		path: path.join( __dirname, 'build' ),
		filename: 'desktop.js',
		libraryTarget: 'commonjs2'
	}
};

module.exports = Object.assign( shared, options );
