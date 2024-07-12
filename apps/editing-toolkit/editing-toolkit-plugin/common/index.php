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