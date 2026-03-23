const babel = require( '@babel/core' );
const presets = require( './presets' );

const clonePreset = ( preset ) => ( {
	...preset,
	presets: [ ...( preset.presets || [] ) ],
	plugins: ( preset.plugins || [] ).map( ( plugin ) => {
		if ( ! Array.isArray( plugin ) ) {
			return plugin;
		}

		const clonedPlugin = [ ...plugin ];

		if ( clonedPlugin[ 1 ] && typeof clonedPlugin[ 1 ] === 'object' ) {
			clonedPlugin[ 1 ] = { ...clonedPlugin[ 1 ] };
		}

		return clonedPlugin;
	} ),
} );

/**
 * Merge options object with existing babel-i18n plugin options.
 * @param   {Object} preset  Config object from extendBaseOptions.
 * @param   {Object} options Additional options object.
 * @returns {Object} Config object with merged options.
 */
const mergeOptions = ( preset, options = {} ) => {
	const config = clonePreset( preset );
	const plugins = config.plugins;
	const babelI18nOptions = plugins[ plugins.length - 1 ][ 1 ];
	const mergedOptions = { ...babelI18nOptions, ...options };

	plugins[ plugins.length - 1 ][ 1 ] = mergedOptions;

	return config;
};

module.exports = ( filepath, options = {} ) => {
	try {
		const { preset = 'default', ...restOptions } = options;
		return babel.transformFileSync( filepath, mergeOptions( presets[ preset ], restOptions ) );
	} catch ( error ) {
		console.error( filepath, error );
	}
};
