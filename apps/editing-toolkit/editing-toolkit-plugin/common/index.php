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
 * Register data stores that may be useful for a variety of concerns
 */
function register_data_stores() {
	$path         = plugin_dir_path( __FILE__ ) . 'dist/data_stores.js';
	$asset_file   = plugin_dir_path( __FILE__ ) . 'dist/data-stores.asset.php';
	$asset        = file_exists( $asset_file ) ? require $asset_file : null;
	$dependencies = isset( $asset['dependencies'] ) ? $asset['dependencies'] : array();
	$version      = isset( $asset['version'] ) ? $asset['version'] : filemtime( $path );

	wp_register_script(
		'a8c-fse-common-data-stores',
		plugins_url( 'dist/data-stores.js', __FILE__ ),
		$dependencies,
		$version,
		true
	);
}
add_action( 'init', __NAMESPACE__ . '\register_data_stores' );

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

/**
 * Enable line-height settings for all themes with Gutenberg.
 *
 * Prior to Gutenberg 8.6, line-height was always enabled, which meant that wpcom
 * users had been utilizing the feature. With the 8.6 release, though, line-height
 * was turned off by default unless the theme supported it. As a result, users
 * suddenly were no longer able to access the settings they previously had access
 * to. This filter turns the setting on for all wpcom users regardless of theme.
 *
 * Note: we use a priority of 11 so that this filter runs after the one which
 * turns off custom line height depending on theme support.
 *
 * @see https://github.com/WordPress/gutenberg/pull/23904
 *
 * @param array $settings The associative array of Gutenberg editor settings with
 *                        line-height sometimes disabled based on theme support.
 * @return array Gutenberg editor settings with line-height setting always enabled.
 **/
function wpcom_gutenberg_enable_custom_line_height( $settings ) {
	$settings['enableCustomLineHeight'] = true;
	return $settings;
}
add_filter( 'block_editor_settings', __NAMESPACE__ . '\wpcom_gutenberg_enable_custom_line_height', 11 );
