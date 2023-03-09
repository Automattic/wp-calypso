<?php
/**
 * Block Name:  Universal Header Navigation
 * Description: The WordPress.com header navigation put into a block to be used everywhere.
 * Author:      Vertex
 * Text Domain: happy-blocks
 *
 * @package universal-header
 */

/**
 * Render happy-tools/universal-header placeholder. Accepts attributes and content to filter the save before its displayed.
 *
 * @param array $block_attributes Block attributes.
 * @return string
 */
function universal_header_render_callback( $block_attributes ) {
	$json_attributes = htmlspecialchars( wp_json_encode( $block_attributes ), ENT_QUOTES, 'UTF-8' );
	$logo_color      = $block_attributes['logoColor'] ?? '#0675c4'; // Default to WordPress.com blue.
	$header          = file_get_contents( plugin_dir_path( __FILE__ ) . '/build/index.html' );

	// Set the logo color.
	$header = str_replace( '%LOGO-COLOR%', $logo_color, $header );

	return '<header><div data-attributes="' . $json_attributes . '" class="happy-blocks-universal-header-block" >' . $header . '</div></header>';
}

/**
 * Register happy-blocks.
 */
function happyblocks_universal_header_register() {
	register_block_type(
		__DIR__ . ( is_rtl() ? '/build/rtl/block.json' : '/build/block.json' ),
		array(
			'render_callback' => 'universal_header_render_callback',
		)
	);
}

add_action( 'init', 'happyblocks_universal_header_register' );
