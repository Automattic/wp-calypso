/**
 * External Dependencies
 */
const TerserPlugin = require( 'terser-webpack-plugin' );

module.exports = ( { shouldMinify, cache, parallel, sourceMap, terserOptions } ) => ( {
	minimize: shouldMinify,
	minimizer: [ new TerserPlugin( { cache, parallel, sourceMap, terserOptions } ) ],
} );
