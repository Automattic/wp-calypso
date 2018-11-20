<?php
/**
 * Plugin Name: Gutenberg Test Align Hook
 * Plugin URI: https://github.com/WordPress/gutenberg
 * Author: Gutenberg Team
 *
 * @package gutenberg-test-align-hook
 */
wp_enqueue_script(
	'gutenberg-test-align-hook',
	plugins_url( 'align-hook/index.js', __FILE__ ),
	array(
		'wp-blocks',
		'wp-element',
		'wp-editor',
		'wp-i18n'
	),
	filemtime( plugin_dir_path( __FILE__ ) . 'align-hook/index.js' ),
	true
);
