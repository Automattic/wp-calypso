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

	if ( defined( 'MU_WPCOM_SLIDER_WIDTH' ) && MU_WPCOM_SLIDER_WIDTH ) {
		return;
	}

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
	if ( defined( 'MU_WPCOM_CUSTOM_LINE_HEIGHT' ) && MU_WPCOM_CUSTOM_LINE_HEIGHT ) {
		return;
	}

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
 * Overrides the block editor preview button url with one that accounts for third party cookie
 * blocking.
 */
function enqueue_override_preview_button_url() {
	if ( defined( 'MU_WPCOM_OVERRIDE_PREVIEW_BUTTON_URL' ) && MU_WPCOM_OVERRIDE_PREVIEW_BUTTON_URL ) {
		return;
	}

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
