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
	$path         = plugin_dir_path( __FILE__ ) . 'dist/data_stores.min.js';
	$asset_file   = plugin_dir_path( __FILE__ ) . 'dist/data-stores.asset.php';
	$asset        = file_exists( $asset_file ) ? require $asset_file : null;
	$dependencies = isset( $asset['dependencies'] ) ? $asset['dependencies'] : array();
	$version      = isset( $asset['version'] ) ? $asset['version'] : filemtime( $path );

	wp_register_script(
		'a8c-fse-common-data-stores',
		plugins_url( 'dist/data-stores.min.js', __FILE__ ),
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
 * Detects if the site is using Gutenberg 9.2 or above, which contains a bug in the
 * interface package, causing some "slider" blocks (such as Jetpack's Slideshow) to
 * incorrectly calculate their width as 33554400px when set at full width.
 *
 * @see https://github.com/WordPress/gutenberg/pull/26552
 *
 * @return bool True if the site needs a temporary fix for the incorrect slider width.
 */
function needs_slider_width_workaround() {
	global $post;

	if (
		( defined( 'GUTENBERG_DEVELOPMENT_MODE' ) && GUTENBERG_DEVELOPMENT_MODE ) ||
		( defined( 'GUTENBERG_VERSION' ) && version_compare( GUTENBERG_VERSION, '9.2', '>=' ) )
	) {
		// Workaround only needed when in the editor.
		return isset( $post );
	}
	return false;
}

/**
 * Determines whether the user should be included in trialing a new font-smoothing rule.
 *
 * @return bool True if antialiased font-smoothing rule should be applied.
 */
function use_font_smooth_antialiased() {
	if ( defined( 'A8C_USE_FONT_SMOOTHING_ANTIALIASED' ) ) {
		return (bool) A8C_USE_FONT_SMOOTHING_ANTIALIASED;
	}

	return true;
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
	return (bool) is_homepage_title_hidden() || needs_slider_width_workaround() || use_font_smooth_antialiased();
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

	if ( needs_slider_width_workaround() ) {
		$classes .= ' slider-width-workaround';
	}

	if ( use_font_smooth_antialiased() && ! is_network_admin() ) {
		// Extra space needed because the `legacy-color-*` class isn't adding
		// a leading space and breaking this class string.
		$classes .= ' font-smoothing-antialiased ';
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
		plugins_url( 'dist/common.min.js', __FILE__ ),
		is_array( $script_dependencies ) ? $script_dependencies : array(),
		filemtime( plugin_dir_path( __FILE__ ) . 'dist/common.min.js' ),
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
add_action( 'admin_enqueue_scripts', __NAMESPACE__ . '\enqueue_script_and_style' );

/**
 * Enable line-height settings for all themes with Gutenberg.
 *
 * Prior to Gutenberg 8.6, line-height was always enabled, which meant that wpcom
 * users had been utilizing the feature. With the 8.6 release, though, line-height
 * was turned off by default unless the theme supported it. As a result, users
 * suddenly were no longer able to access the settings they previously had access
 * to. This turns the setting on for all wpcom users regardless of theme.
 *
 * @see https://github.com/WordPress/gutenberg/pull/23904
 **/
function wpcom_gutenberg_enable_custom_line_height() {
	add_theme_support( 'custom-line-height' );
}
add_action( 'after_setup_theme', __NAMESPACE__ . '\wpcom_gutenberg_enable_custom_line_height' );

/**
 * Returns ISO 639 conforming locale string.
 *
 * @param string $language a language tag to be converted e.g. "en_US".
 * @return string ISO 639 locale string e.g. "en"
 */
function get_iso_639_locale( $language ) {
	$language = strtolower( $language );

	if ( in_array( $language, array( 'pt_br', 'pt-br', 'zh_tw', 'zh-tw', 'zh_cn', 'zh-cn' ), true ) ) {
		$language = str_replace( '_', '-', $language );
	} else {
		$language = preg_replace( '/([-_].*)$/i', '', $language );
	}

	if ( empty( $language ) ) {
		return 'en';
	}

	return $language;
}

/**
 * Hides plugin buttons that appear in the header on mobile devices
 * (because there's not enough room).
 *
 * Can be disabled with the `a8c_fse_enqueue_hide_plugin_buttons_mobile_style` filter.
 */
function enqueue_hide_plugin_buttons_mobile_style() {
	if ( apply_filters( 'a8c_fse_enqueue_hide_plugin_buttons_mobile_style', true ) ) {
		$style_file = is_rtl()
			? 'hide-plugin-buttons-mobile.rtl.css'
			: 'hide-plugin-buttons-mobile.css';
		wp_enqueue_style(
			'a8c-fse-hide-plugin-buttons-mobile',
			plugins_url( 'dist/' . $style_file, __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/' . $style_file )
		);
	}
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_hide_plugin_buttons_mobile_style' );

/**
 * Prevent HEIC images from being uploaded by drag and drop
 * See: https://github.com/Automattic/wp-calypso/issues/55102
 *
 * Can be disabled with the `a8c_disable_heic_images` filter.
 */
function enqueue_disable_heic_images_script() {
	if ( apply_filters( 'a8c_disable_heic_images', true ) ) {
		wp_enqueue_script(
			'a8c-disable-heic-images',
			plugins_url( 'dist/disable-heic-images.min.js', __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/disable-heic-images.min.js' ),
			true
		);
	}
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_disable_heic_images_script' );

/**
 * Overrides the block editor preview button url with one that accounts for third party cookie
 * blocking.
 */
function enqueue_override_preview_button_url() {
	if ( ! function_exists( 'is_blog_atomic' ) ) {
		return;
	};

	$blog_details = get_blog_details( get_current_blog_id() );

	if ( is_blog_atomic( $blog_details ) ) {
		return;
	}

	wp_enqueue_script(
		'a8c_override_preview_button_url',
		plugins_url( 'dist/override-preview-button-url.min.js', __FILE__ ),
		array(),
		filemtime( plugin_dir_path( __FILE__ ) . 'dist/override-preview-button-url.min.js' ),
		true
	);
}

add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_override_preview_button_url' );
