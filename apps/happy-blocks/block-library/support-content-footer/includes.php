<?php
/**
 * Title: Footer content for support sites
 * Slug: happy-blocks/support-content-footer
 * Categories: support
 *
 * @package happy-blocks
 */

if ( ! function_exists( 'happy_blocks_get_content_footer_asset' ) ) {
	/**
	 * Find the URL of the asset file from happy-blocks.
	 *
	 * @param file $file The file name.
	 */
	function happy_blocks_get_content_footer_asset( $file ) {
		return array(
			'path'    => "https://wordpress.com/wp-content/a8c-plugins/happy-blocks/block-library/support-content-footer/build/$file",
			'version' => filemtime( __DIR__ . "/build/$file" ),
		);
	}
}

$css = happy_blocks_get_content_footer_asset( is_rtl() ? 'view.rtl.css' : 'view.css' );

wp_enqueue_style( 'happy-blocks-support-footer-style', $css['path'], array(), $css['version'] );
