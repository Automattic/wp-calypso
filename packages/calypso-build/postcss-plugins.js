const dsTokenFallbacks =
	require( '@wordpress/theme/postcss-plugins/postcss-ds-token-fallbacks' ).default;
const autoprefixer = require( 'autoprefixer' );
const postcssCustomProperties = require( 'postcss-custom-properties' );

/**
 * Returns the PostCSS plugins used across Calypso style builds.
 *
 * @param {Object}  options
 * @param {boolean} options.customProperties Whether to include `postcss-custom-properties`.
 * @returns {import('postcss').AcceptedPlugin[]}
 */
function getPostCssPlugins( { customProperties = false } = {} ) {
	const plugins = [];

	if ( customProperties ) {
		plugins.push( postcssCustomProperties() );
	}

	plugins.push( dsTokenFallbacks(), autoprefixer() );

	return plugins;
}

module.exports = { getPostCssPlugins };
