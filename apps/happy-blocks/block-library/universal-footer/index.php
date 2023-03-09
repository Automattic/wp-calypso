<?php
/**
 * Block Name:  Universal Footer Navigation
 * Description: The WordPress.com footer navigation put into a block to be used everywhere.
 * Author:      Vertex
 * Text Domain: happy-blocks
 *
 * @package universal-footer
 */

/**
 * Render happy-tools/universal-footer placeholder. Accepts attributes and content to filter the save before its displayed.
 *
 * @param array $block_attributes Block attributes.
 * @return string
 */
function universal_footer_render_callback( $block_attributes ) {
	$json_attributes = htmlspecialchars( wp_json_encode( $block_attributes ), ENT_QUOTES, 'UTF-8' );
	$footer          = file_get_contents( plugin_dir_path( __FILE__ ) . '/build/index.html' );

	return '<footer><div data-attributes="' . $json_attributes . '" class="happy-blocks-universal-footer-block" >' . $footer . '</div></footer>';
}

/**
 * Register happy-blocks.
 */
function happyblocks_universal_footer_register() {
	register_block_type(
		__DIR__ . ( is_rtl() ? '/build/rtl' : '/build' ),
		array(
			'render_callback' => 'universal_footer_render_callback',
		)
	);
}

add_action( 'init', 'happyblocks_universal_footer_register' );
