<?php
/**
 * File for various functionality which needs to be added to Simple and Atomic
 * sites. The code in this file is always loaded.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE\Common;

/**
 * Adds custom classes to the admin body classes.
 *
 * @param string $classes Classes for the body element.
 * @return string
 */
function admin_body_classes( $classes ) {
	global $post;
	$is_block_editor_screen = ( function_exists( 'get_current_screen' ) && get_current_screen() && get_current_screen()->is_block_editor() );
	$hide                   = get_theme_mod( 'hide_front_page_title', false );
	$front_page             = (int) get_option( 'page_on_front' );
	$id                     = $post->ID;
	if ( $is_block_editor_screen && $front_page === $post->ID && true === $hide ) {
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
