<?php
/**
 * Plugin Name: Gutenberg Test Container Block Without paragraph
 * Plugin URI: https://github.com/WordPress/gutenberg
 * Author: Gutenberg Team
 *
 * @package gutenberg-test-container-without-paragraph
 */
wp_enqueue_script(
	'gutenberg-test-container-without-paragraph',
	plugins_url( 'container-without-paragraph/index.js', __FILE__ ),
	array(
		'wp-blocks',
		'wp-element',
		'wp-editor',
	),
	filemtime( plugin_dir_path( __FILE__ ) . 'container-without-paragraph/index.js' ),
	true
);
