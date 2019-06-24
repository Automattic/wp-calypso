<?php
/**
 * Render site-logo block file.
 *
 * @package full-site-editing
 */

/**
 * Renders a site logo.
 *
 * @param array  $attributes Block attributes.
 * @param string $content    Block content.
 * @return string
 */
function render_site_logo( $attributes, $content ) {
	if ( true === $attributes['editorPreview'] ) {
		return render_site_logo_editor_preview( $attributes, $content );
	}
	return render_site_logo_publish( $attributes, $content );
}

/**
 * Renders the site logo on the front-end.
 *
 * @return string
 */
function render_site_logo_publish() {
	if ( ! function_exists( 'get_custom_logo' ) || ! function_exists( 'has_custom_logo' ) ) {
		return '';
	}

	if ( ! has_custom_logo() ) {
		return '';
	}

	return get_custom_logo();
}

/**
 * Renders the site logo in the block editor.
 *
 * @return string
 */
function render_site_logo_editor_preview() {
	if ( ! function_exists( 'get_custom_logo' ) || ! function_exists( 'has_custom_logo' ) ) {
		return sprintf( '<div class="components-placeholder"><div class="components-placeholder__label">%1$s</div></components-placeholder__label><div class="components-placeholder__instructions">%2$s</div></div>', __( 'Site Logo', 'full-site-editing' ), __( 'No Logo Support!', 'full-site-editing' ) );
	}

	if ( ! has_custom_logo() ) {
		return sprintf( '<div class="components-placeholder has-no-logo"><div class="components-placeholder__label">%1$s</div></components-placeholder__label><div class="components-placeholder__instructions">%2$s</div></div>', __( 'Site Logo', 'full-site-editing' ), __( 'Click on the Edit button to select a Site Logo.', 'full-site-editing' ) );
	}

	return get_custom_logo();
}
