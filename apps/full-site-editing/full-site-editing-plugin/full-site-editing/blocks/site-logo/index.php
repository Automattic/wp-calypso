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
	if ( $attributes[ 'editorPreview' ] === true ) {
		return render_site_logo_editor_preview( $attributes, $content );
	}
	return render_site_logo_publish( $attributes, $content );
}

function render_site_logo_publish( $attributes, $content ) {

	if ( ! function_exists( 'get_custom_logo' ) || ! function_exists( 'has_custom_logo' ) ) {
		return '';
	}

	if ( ! has_custom_logo() ) {
		return '';
	}

	//publish view
	return get_custom_logo();
}

function render_site_logo_editor_preview( $attributes, $content ) {

	if ( ! function_exists( 'get_custom_logo' ) || ! function_exists( 'has_custom_logo' ) ) {
		return sprintf( '<div class="components-placeholder"><div class="components-placeholder__label">%1$s</div></components-placeholder__label><div class="components-placeholder__instructions">%2$s</div></div>', __( 'Site Logo', 'full-site-editing' ), __( 'No Logo Support!', 'full-site-editing' ) );
	}

	if ( ! has_custom_logo() ) {
		return sprintf( '<div class="components-placeholder has-no-logo"><div class="components-placeholder__label">%1$s</div></components-placeholder__label><div class="components-placeholder__instructions">%2$s</div></div>', __( 'Site Logo', 'full-site-editing' ), __( 'Click on the Edit button to select a Site Logo', 'full-site-editing' ) );
	}

	//render without wrapping link to avoid, navigation away from the editor
	$custom_logo_id = get_theme_mod( 'custom_logo' );
	return wp_get_attachment_image( $custom_logo_id , 'full', false, array(
		'class'    => 'custom-logo',
	) );
}