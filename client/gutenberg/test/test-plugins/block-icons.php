<?php
/**
 * Plugin Name: Gutenberg Test Block Icons
 * Plugin URI: https://github.com/WordPress/gutenberg
 * Author: Gutenberg Team
 *
 * @package gutenberg-test-block-icons
 */
wp_enqueue_script(
	'gutenberg-test-block-icons',
	plugins_url( 'block-icons/index.js', __FILE__ ),
	array(
		'wp-blocks',
		'wp-components',
		'wp-element',
		'wp-editor',
		'wp-hooks',
		'wp-i18n',
	),
	filemtime( plugin_dir_path( __FILE__ ) . 'block-icons/index.js' ),
	true
);
