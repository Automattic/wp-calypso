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
 * @param array $attributes Block attributes.
 * @return string
 */
function universal_footer_render_callback( $attributes, $content ) {
	return $content;
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

add_filter(
	'wp_kses_allowed_html',
	function ( $tags ) {
		$tags['svg']  = array(
			'xmlns'       => array(),
			'fill'        => array(),
			'viewbox'     => array(),
			'role'        => array(),
			'aria-hidden' => array(),
			'focusable'   => array(),
		);
		$tags['path'] = array(
			'd'    => array(),
			'fill' => array(),
		);
		return $tags;

	},
	10,
	2
);
