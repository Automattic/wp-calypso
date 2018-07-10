<?php
/**
 * Server-side rendering of the `core/block` block.
 *
 * @package gutenberg
 */

/**
 * Renders the `core/block` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Rendered HTML of the referenced block.
 */
function render_block_core_block( $attributes ) {
	if ( empty( $attributes['ref'] ) ) {
		return '';
	}

	$shared_block = get_post( $attributes['ref'] );
	if ( ! $shared_block || 'wp_block' !== $shared_block->post_type ) {
		return '';
	}

	$blocks = gutenberg_parse_blocks( $shared_block->post_content );

	$block = array_shift( $blocks );
	if ( ! $block ) {
		return '';
	}

	return gutenberg_render_block( $block );
}

register_block_type( 'core/block', array(
	'attributes'      => array(
		'ref' => array(
			'type' => 'number',
		),
	),

	'render_callback' => 'render_block_core_block',
) );
