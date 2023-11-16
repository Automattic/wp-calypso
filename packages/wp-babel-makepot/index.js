const babel = require( '@babel/core' );
const presets = require( './presets' );

/**
 * Merge options object with existing babel-i18n plugin options.
 * @param   {Object} preset  Config object from extendBaseOptions.
 * @param   {Object} options Additional options object.
 * @returns {Object} Config object with merged options.
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
		const { preset = 'default', ...restOptions } = options;
		return babel.transformFileSync( filepath, mergeOptions( presets[ preset ], restOptions ) );
	} catch ( error ) {
		console.error( filepath, error );
	}
};
