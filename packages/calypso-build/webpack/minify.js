/**
 * External Dependencies
 */
const TerserPlugin = require( 'terser-webpack-plugin' );

const terserDefaults = {
	ecma: 5,
	safari10: true,
	mangle: true,
};

module.exports = ( { cache = true, parallel = 2, sourceMap = true, terserOptions = {} } ) =>
	new TerserPlugin( {
		cache,
		parallel,
		sourceMap,
		terserOptions: Object.assign( {}, terserDefaults, terserOptions ),
	} );
