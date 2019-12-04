<?php
/**
 * Server-side rendering of the `core/site-logo` block.
 *
 * @package WordPress
 */

/**
 * Renders the `core/site-logo` block on the server.
 *
 * @return string The render.
 */
function render_site_logo_block( $attributes ) {
	$image_attrs_filter = function ( $image_attrs ) use ( $attributes ) {
		if ( ! empty( $attributes['align'] ) ) {
			$image_attrs['align'] = $attributes['align'];
		}
		if ( ! empty( $attributes['width'] ) ) {
			$image_attrs['width'] = $attributes['width'] . '%';
		}
		return $image_attrs;
	};

	add_filter( 'wp_get_attachment_image_attributes', $image_attrs_filter );
	$html = get_custom_logo( get_current_blog_id() );
	remove_filter( 'wp_get_attachment_image_attributes', $image_attrs_filter );

	if ( ! empty( $attributes['width'] ) ) {
		// Strip the default width and height if we are setting our own
		$html = preg_replace( '/width="[0-9]+"/', '', $html );
		$html = preg_replace( '/height="[0-9]+"/', '', $html );
	}

	return $html;
}

/**
 * Registers the `core/site-logo` block on the server.
 */
function register_block_core_site_logo() {
	if ( gutenberg_is_experiment_enabled( 'gutenberg-full-site-editing' ) ) {
		register_block_type(
			'core/site-logo',
			array(
				'render_callback' => 'render_block_core_site_logo',
			)
		);
		add_filter( 'pre_set_theme_mod_custom_logo', 'sync_site_logo_to_theme_mod' );
		add_filter( 'theme_mod_custom_logo', 'override_custom_logo_theme_mod' );
	}
}

function override_custom_logo_theme_mod( $custom_logo ) {
	$sitelogo = get_option( 'sitelogo' );
	return false === $sitelogo ? $custom_logo : $sitelogo; 
}

function sync_site_logo_to_theme_mod( $custom_logo ) {
	if ( $custom_logo ) {
		update_option( 'sitelogo', $custom_logo );
	}
	return $custom_logo;
}

function register_block_core_site_logo_setting() {
	register_setting(
		'general',
		'sitelogo',
		array(
			'show_in_rest' => array(
				'name' => 'sitelogo',
			),
			'type'         => 'string',
			'description'  => __( 'Site logo.' ),
		)
	);
}

add_action( 'rest_api_init', 'register_block_core_site_logo_setting', 10 );
