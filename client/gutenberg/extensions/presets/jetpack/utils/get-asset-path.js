/** @format */

/**
 * Get an asset's path correctly by environment
 *
 * Leverage exposed global variables to ensure we can locate assets in the plugin or Calypso
 *
 * @see webpack DefinePlugine rule
 * @see Jetpack_Gutenberg for handling in Jetpack WP Admin
 *
 * @param  {string} path The asset
 * @return {string}      URL where the asset may be located.
 */
export default function getAssetPath( path ) {
	if ( typeof window === 'object' && window.Jetpack_Static_Block_Assets_Base_Url ) {
		return `${ window.Jetpack_Static_Block_Assets_Base_Url }/${ path }`;
	}

	// Best guess
	return `/wp-content/plugins/jetpack/_inc/blocks/static/${ path }`;
}
