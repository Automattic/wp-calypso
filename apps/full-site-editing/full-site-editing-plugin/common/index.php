<?php
/**
 * File for various functionality which needs to be added to Simple and Atomic
 * sites. The code in this file is always loaded in the block editor.
 *
 * Currently, this module may not be the best place if you need to load
 * front-end assets, but you could always add a separate action for that.
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
 * Detects if the current page is the homepage post editor, and if the homepage
 * title is hidden.
 *
 * @return bool True if the homepage title features should be used. (See above.)
 */
function is_homepage_title_hidden() {
	global $post;

	// Handle the case where we are not rendering a post.
	if ( ! isset( $post ) ) {
		return false;
	}

	$hide_homepage_title = (bool) get_theme_mod( 'hide_front_page_title', false );
	$is_homepage         = ( (int) get_option( 'page_on_front' ) === $post->ID );
	return (bool) is_block_editor_screen() && $hide_homepage_title && $is_homepage;
}

/**
 * Detects if assets for the common module should be loaded.
 *
 * It should return true if any of the features added to the common module need
 * to be loaded. To accomplish this, please create separate functions if you add
 * other small features to this file. The separate function should detect if your
 * individual feature ought to be loaded. Then, "or" (||) that together with the
 * return value here.
 *
 * @return bool True if the common module assets should be loaded.
 */
function should_load_assets() {
	return (bool) is_homepage_title_hidden();
}

/**
 * Adds custom classes to the admin body classes.
 *
 * @param string $classes Classes for the body element.
 * @return string
 */
function admin_body_classes( $classes ) {
	if ( is_homepage_title_hidden() ) {
		$classes .= ' hide-homepage-title';
	}

	return $classes;
}
add_filter( 'admin_body_class', __NAMESPACE__ . '\admin_body_classes' );

/**
 * Enqueue script and style for the common package.
 */
function enqueue_script_and_style() {
	// Avoid loading assets if possible.
	if ( ! should_load_assets() ) {
		return;
	}

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
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_script_and_style' );
