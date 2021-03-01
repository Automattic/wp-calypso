/**
 * External dependencies
 */
const babel = require( '@babel/core' );

/**
 * Internal dependencies
 */
const defaultPreset = require( './presets' ).default;

/**
 * Merge options object with existing babel-i18n plugin options.
 *
 * @param   {object} preset  Config object from extendBaseOptions.
 * @param   {object} options Additional options object.
 * @returns {object} Config object with merged options.
 */
const mergeOptions = ( preset, options = {} ) => {
	const plugins = preset.plugins;
	const babelI18nOptions = plugins[ plugins.length - 1 ][ 1 ];
	const mergedOptions = { ...babelI18nOptions, ...options };

	plugins[ plugins.length - 1 ][ 1 ] = mergedOptions;

	return preset;
};

module.exports = ( filepath, options = {} ) => {
	try {
		return babel.transformFileSync( filepath, mergeOptions( defaultPreset, options ) );
	} catch ( error ) {
		console.error( filepath, error );
	}
};
