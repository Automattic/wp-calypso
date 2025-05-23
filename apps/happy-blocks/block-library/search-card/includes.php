<?php
/**
 * Title: Search card content for support sites
 * Slug: happy-blocks/search-card
 * Categories: support
 *
 * @package happy-blocks
 */

if ( ! function_exists( 'happy_blocks_get_search_card_asset' ) ) {
	/**
	 * Find the URL of the asset file from happy-blocks.
	 *
	 * @param file $file The file name.
	 */
	function happy_blocks_get_search_card_asset( $file ) {
		return array(
			'path'    => "https://wordpress.com/wp-content/a8c-plugins/happy-blocks/block-library/search-card/build/$file",
			'version' => filemtime( __DIR__ . "/build/$file" ),
		);
	}
}

$css = happy_blocks_get_search_card_asset( is_rtl() ? 'view.rtl.css' : 'view.css' );
wp_enqueue_style( 'happy-blocks-support-search-card-style', $css['path'], array(), $css['version'] );
