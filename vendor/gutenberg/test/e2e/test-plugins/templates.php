<?php
/**
 * Plugin Name: Gutenberg Test Plugin, Templates
 * Plugin URI: https://github.com/WordPress/gutenberg
 * Author: Gutenberg Team
 *
 * @package gutenberg-test-templates
 */

/**
 * Registers a book CPT with a template
 */
function gutenberg_test_templates_register_book_type() {
	$args = array(
		'public' => true,
		'label'  => 'Books',
		'show_in_rest' => true,
		'template' => array(
			array( 'core/image' ),
			array(
				'core/paragraph',
				array(
					'placeholder' => 'Add a book description',
				),
			),
			array( 'core/quote' ),
			array(
				'core/columns',
				array(),
				array(
					array(
						'core/column',
						array(),
						array(
							array( 'core/image' ),
						),
					),
					array(
						'core/column',
						array(),
						array(
							array(
								'core/paragraph',
								array(
									'placeholder' => 'Add a inner paragraph',
								),
							),
						),
					),
				),
			),
		),
	);
	register_post_type( 'book', $args );
}

add_action( 'init', 'gutenberg_test_templates_register_book_type' );
