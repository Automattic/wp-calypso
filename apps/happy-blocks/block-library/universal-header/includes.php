<?php
/**
 * Title: Search Bar with Heading
 * Slug: happy-blocks/search
 * Categories: support
 *
 * @package happy-blocks
 */

if ( ! function_exists( 'happy_blocks_get_asset' ) ) {
	/**
	 * Find the URL of the asset file from happy-blocks.
	 *
	 * @param file $file The file name.
	 */
	function happy_blocks_get_asset( $file ) {
		return array(
			'path'    => "https://wordpress.com/wp-content/a8c-plugins/happy-blocks/block-library/universal-header/build/$file",
			'version' => filemtime( __DIR__ . "/build/$file" ),
		);
	}
}

$happy_blocks_header_js  = happy_blocks_get_asset( 'index.js' );
$happy_blocks_header_css = happy_blocks_get_asset( is_rtl() ? 'index.rtl.css' : 'index.css' );

wp_enqueue_style( 'happy-blocks-search-style', $happy_blocks_header_css['path'], array(), $happy_blocks_header_css['version'] );
wp_enqueue_script( 'happy-blocks-search-script', $happy_blocks_header_js['path'], array(), $happy_blocks_header_js['version'], true );

// Including view.js and view.css, we are adding the styling and functionality of the wpcom nav bar.
$wpcom_nav_bar_js  = happy_blocks_get_asset( 'view.js' );
$wpcom_nav_bar_css = happy_blocks_get_asset( is_rtl() ? 'view.rtl.css' : 'view.css' );

wp_enqueue_style( 'happy-blocks-search-style_logged_out', $wpcom_nav_bar_css['path'], array(), $wpcom_nav_bar_css['version'] );
wp_enqueue_script( 'happy-blocks-search-script_logged_out', $wpcom_nav_bar_js['path'], array(), $wpcom_nav_bar_js['version'], true );
