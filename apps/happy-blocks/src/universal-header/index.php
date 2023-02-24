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
 * @param array $attributes Block attributes.
 * @return string
 */
function universal_header_render_callback( $attributes ) {
	// inject the current locale to the attributes.
	$attributes['locale'] = get_locale();

	$json_attributes = htmlspecialchars( wp_json_encode( $attributes ), ENT_QUOTES, 'UTF-8' );

	return '
		<div data-attributes="' . $json_attributes . '" class="happy-blocks-universal-header-block" />
	';
}

/**
 * Register happy-blocks.
 */
function happyblocks_universal_header_register() {
	register_block_type(
		__DIR__ . ( is_rtl() ? '/rtl/block.json' : '/block.json' ),
		array(
			'render_callback' => 'universal_header_render_callback',
		)
	);
}

add_action( 'init', 'happyblocks_universal_header_register' );
