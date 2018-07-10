/**
 * External dependencies
 */
const { get, map } = require( 'lodash' );
const babel = require( '@babel/core' );

/**
 * WordPress dependencies
 */
const { options: babelDefaultConfig } = babel.loadPartialConfig( {
	configFile: '@wordpress/babel-preset-default',
} );
const plugins = babelDefaultConfig.plugins;
if ( ! process.env.SKIP_JSX_PRAGMA_TRANSFORM ) {
	plugins.push( [ '@wordpress/babel-plugin-import-jsx-pragma', {
		scopeVariable: 'createElement',
		source: '@wordpress/element',
		isDefault: false,
	} ] );
}

const babelConfigs = {
	main: Object.assign(
		{},
		babelDefaultConfig,
		{
			plugins,
			presets: map( babelDefaultConfig.presets, ( preset ) => {
				if ( get( preset, [ 'file', 'request' ] ) === '@babel/preset-env' ) {
					return [ '@babel/preset-env', Object.assign(
						{},
						preset.options,
						{ modules: 'commonjs' }
					) ];
				}
				return preset;
			} ),
		}
	),
	module: Object.assign(
		{},
		babelDefaultConfig,
		{
			plugins,
		}
	),
};

function getBabelConfig( environment ) {
	return babelConfigs[ environment ];
}

module.exports = getBabelConfig;
