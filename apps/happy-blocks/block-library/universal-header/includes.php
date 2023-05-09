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

$header_js  = happy_blocks_get_asset( 'index.js' );
$header_css = happy_blocks_get_asset( is_rtl() ? 'index.rtl.css' : 'index.css' );

wp_enqueue_style( 'happy-blocks-search-style', $header_css['path'], array(), $header_css['version'] );
wp_enqueue_script( 'happy-blocks-search-script', $header_js['path'], array(), $header_js['version'], true );

if ( ! is_user_logged_in() ) {
	$js  = happy_blocks_get_asset( 'view.js' );
	$css = happy_blocks_get_asset( is_rtl() ? 'view.rtl.css' : 'view.css' );

	wp_enqueue_style( 'happy-blocks-search-style_logged_out', $css['path'], array(), $css['version'] );
	wp_enqueue_script( 'happy-blocks-search-script_logged_out', $js['path'], array(), $js['version'], true );
}


