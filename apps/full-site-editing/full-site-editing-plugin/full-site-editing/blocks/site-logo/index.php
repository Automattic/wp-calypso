<?php
/**
 * Render site-logo block file.
 *
 * @package full-site-editing
 */

/**
 * Renders a site-logo.
 *
 * @param array  $attributes Block attributes.
 * @param string $content    Block content.
 * @return string
 */
function render_site_logo( $attributes, $content ) {

	if ( ! function_exists( 'get_custom_logo' ) || ! function_exists( 'has_custom_logo' ) ) {
		return '';
	}

	if ( ! has_custom_logo() ) {
		return '';
	}

	return get_custom_logo();
}