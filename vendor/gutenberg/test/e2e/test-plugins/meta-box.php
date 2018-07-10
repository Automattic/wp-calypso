<?php

/**
 * Plugin Name: Gutenberg Test Plugin, Meta Box
 * Plugin URI: https://github.com/WordPress/gutenberg
 * Author: Gutenberg Team
 *
 * @package gutenberg-test-meta-box
 */

function gutenberg_test_meta_box_render_meta_box() {
	echo 'Hello World';
}

function gutenberg_test_meta_box_add_meta_box() {
	add_meta_box(
		'gutenberg-test-meta-box',
		'Gutenberg Test Meta Box',
		'gutenberg_test_meta_box_render_meta_box',
		'post',
		'normal',
		'high'
	);
}
add_action( 'add_meta_boxes', 'gutenberg_test_meta_box_add_meta_box' );
