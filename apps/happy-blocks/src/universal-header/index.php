<?php
/**
 * Block Name:  Universal Header Navigation
 * Description: The WordPress.com header navigation put into a block to be used everywhere.
 * Author:      Vertex
 *
 * @package universal-header
 */

/**
 * Render happy-tools/universal-header placeholder. Accepts attributes and content to filter the save before its displayed.
 *
 * @return string
 */
function happyblocks_universal_header_render_callback() {
	return <<<HTML
		<div class="happy-blocks-universal-header-block" />
HTML;
}

/**
 * Register happy-blocks.
 */
function happyblocks_universal_header_register() {
	register_block_type(
		'happy-blocks/universal-header',
		array(
			'render_callback' => 'happyblocks_universal_header_render_callback',
		)
	);

}

add_action( 'init', 'happyblocks_universal_header_register' );
