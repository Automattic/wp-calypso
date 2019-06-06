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

	$add_site_link = $attributes['addSiteLink'];

	//publish view
	if ( $add_site_link ) {
		return get_custom_logo();
	}

	//edit view
	$custom_logo_id = get_theme_mod( 'custom_logo' );
	return wp_get_attachment_image( $custom_logo_id , 'full', false, array(
		'class'    => 'custom-logo',
	) );


}