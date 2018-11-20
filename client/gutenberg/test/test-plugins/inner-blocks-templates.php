<?php
/**
 * Plugin Name: Gutenberg Test InnerBlocks Templates
 * Plugin URI: https://github.com/WordPress/gutenberg
 * Author: Gutenberg Team
 *
 * @package gutenberg-test-inner-blocks-templates
 */
wp_enqueue_script(
	'gutenberg-test-inner-blocks-templates',
	plugins_url( 'inner-blocks-templates/index.js', __FILE__ ),
	array(
		'wp-blocks',
		'wp-components',
		'wp-element',
		'wp-editor',
		'wp-hooks',
		'wp-i18n'
	),
	filemtime( plugin_dir_path( __FILE__ ) . 'inner-blocks-templates/index.js' ),
	true
);
