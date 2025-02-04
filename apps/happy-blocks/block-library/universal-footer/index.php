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
 * Register happy-blocks.
 */
function happyblocks_universal_footer_register() {
	register_block_type(
		__DIR__ . ( is_rtl() ? '/build/rtl' : '/build' ),
		array(
			'attributes' => array(
				'locale' => array(
					'type'    => 'string',
					'default' => happy_blocks_get_site_locale(),
				),
			),
		)
	);
}

add_action( 'init', 'happyblocks_universal_footer_register' );
