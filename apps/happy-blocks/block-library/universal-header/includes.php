<?php
/**
 * Title: WPCOM nav bar
 * Slug: happy-blocks/wpcom-nav-bar
 * Categories: support
 *
 * @package happy-blocks
 */

if ( ! function_exists( 'wpcom_navbar_get_assets' ) ) {
	/**
	 * Find the URL of the asset file from happy-blocks.
	 *
	 * @param file $file The file name.
	 */
	function wpcom_navbar_get_assets( $file ) {
		return array(
			'path'    => "https://wordpress.com/wp-content/a8c-plugins/happy-blocks/block-library/universal-header/build/$file",
			'version' => filemtime( __DIR__ . "/build/$file" ),
		);
	}
}

$wpcom_nav_bar_js  = wpcom_navbar_get_assets( 'view.js' );
$wpcom_nav_bar_css = wpcom_navbar_get_assets( is_rtl() ? 'view.rtl.css' : 'view.css' );

wp_enqueue_style( 'wpsupport3-wpcom-navbar-search-style', $wpcom_nav_bar_css['path'], array(), $wpcom_nav_bar_css['version'] );
wp_enqueue_script( 'wpsupport3-wpcom-navbar-search-script', $wpcom_nav_bar_js['path'], array(), $wpcom_nav_bar_js['version'], true );
