<?php
/**
 * Title: Support content links
 * Slug: happy-blocks/support-content-links
 * Categories: support
 *
 * @package happy-blocks
 */

if ( ! function_exists( 'happy_blocks_get_support_content_links_asset' ) ) {
	/**
	 * Find the URL of the asset file from happy-blocks.
	 *
	 * @param file $file The file name.
	 */
	function happy_blocks_get_support_content_links_asset( $file ) {
		return array(
			'path'    => "https://wordpress.com/wp-content/a8c-plugins/happy-blocks/block-library/support-content-links/build/$file",
			'version' => filemtime( __DIR__ . "/build/$file" ),
		);
	}
}

$happy_blocks_header_js  = happy_blocks_get_support_content_links_asset( 'view.js' );
$happy_blocks_header_css = happy_blocks_get_support_content_links_asset( is_rtl() ? 'view.rtl.css' : 'view.css' );

wp_enqueue_style( 'wpsupport3-happy-blocks-support-content-links-style', $happy_blocks_header_css['path'], array(), $happy_blocks_header_css['version'] );
wp_enqueue_script( 'wpsupport3-happy-blocks-support-content-links-script', $happy_blocks_header_js['path'], array(), $happy_blocks_header_js['version'], true );
