<?php
/**
 * File for various functionality which needs to be added to Simple and Atomic
 * sites. The code in this file is always loaded.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE\Common;

/**
 * Can be used to determine if the current screen is the block editor.
 *
 * @return bool True if the current screen is a block editor screen. False otherwise.
 */
function is_block_editor_screen() {
	return is_callable( 'get_current_screen' ) && get_current_screen() && get_current_screen()->is_block_editor();
}

/**
 * Adds custom classes to the admin body classes.
 *
 * @param string $classes Classes for the body element.
 * @return string
 */
function admin_body_classes( $classes ) {
	global $post;

	// Handle the case where we are not rendering a post.
	if ( ! isset( $post ) ) {
		return $classes;
	}

	$hide_homepage_title = (bool) get_theme_mod( 'hide_front_page_title', false );
	$is_homepage         = ( (int) get_option( 'page_on_front' ) === $post->ID );

	if ( is_block_editor_screen() && $hide_homepage_title && $is_homepage ) {
		$classes .= ' hide-homepage-title';
	}

	return $classes;
}
add_filter( 'admin_body_class', __NAMESPACE__ . '\admin_body_classes' );

/**
 * Enqueue script and style for the common package.
 */
function enqueue_script_and_style() {
	$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/common.asset.php';
	$script_dependencies = $asset_file['dependencies'];
	wp_enqueue_script(
		'a8c-fse-common-script',
		plugins_url( 'dist/common.js', __FILE__ ),
		is_array( $script_dependencies ) ? $script_dependencies : array(),
		filemtime( plugin_dir_path( __FILE__ ) . 'dist/common.js' ),
		true
	);

	$style_file = is_rtl()
		? 'common.rtl.css'
		: 'common.css';
	wp_enqueue_style(
		'a8c-fse-common-style',
		plugins_url( 'dist/' . $style_file, __FILE__ ),
		'wp-edit-post',
		filemtime( plugin_dir_path( __FILE__ ) . 'dist/' . $style_file )
	);
}
add_action( 'init', __NAMESPACE__ . '\enqueue_script_and_style' );
