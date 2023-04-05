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
			'path'    => "https://wordpress.com/wp-content/a8c-plugins/happy-blocks/block-library/universal-header/$file",
			'version' => filemtime( __DIR__ . "/$file" ),
		);
	}
}

$js  = happy_blocks_get_asset( 'view.js' );
$css = happy_blocks_get_asset( is_rtl() ? 'view.rtl.css' : 'view.css' );

wp_enqueue_style( 'happy-blocks-search-style', $css['path'], array(), $css['version'] );
wp_enqueue_script( 'happy-blocks-search-script', $js['path'], array(), $js['version'], true );

