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


function gutenberg_test_meta_box_render_head() {
	// Emulates what plugins like Yoast do with meta data on the front end.
	// Tests that our excerpt processing does not interfere with dynamic blocks.
	$excerpt = wp_strip_all_tags( get_the_excerpt() );
	?>
	<meta property="gutenberg:hello" content="<?php echo esc_attr( $excerpt ); ?>" />
	<?php
}

add_action( 'wp_head', 'gutenberg_test_meta_box_render_head' );
