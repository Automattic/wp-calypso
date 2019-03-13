/**
 * External Dependencies
 */
const TerserPlugin = require( 'terser-webpack-plugin' );

module.exports = ( { cache, parallel, sourceMap, terserOptions } ) =>
	new TerserPlugin( { cache, parallel, sourceMap, terserOptions } );
