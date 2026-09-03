const path = require( 'path' );
const baseConfig = require( '../../packages/calypso-build/postcss.config.js' )();
const agentticUiCssPath = require.resolve( '@automattic/agenttic-ui/index.css' );

module.exports = {
	...baseConfig,
	plugins: {
		...baseConfig.plugins,
		'postcss-prefix-selector': {
			prefix: '.agents-manager-chat',
			transform( prefix, selector, prefixedSelector, filePath ) {
				if ( path.normalize( filePath ) !== path.normalize( agentticUiCssPath ) ) {
					return selector;
				}

				return selector.includes( prefix ) ? selector : prefixedSelector;
			},
		},
	},
};
