<?php
/*
 * Plugin Name: A8C Blocks
 * Description: A8C Specific Blocks
 * Author: A8C
 *
 * Instructions:
 * 1. Build `o2-blocks`: `yarn build`
 * 2. Start a test WP instance at the root of the `o2-blocks` repo: `wp-env start`
 * 3. When you access your test WP instance, you should then see the `A8C Blocks` plugin installed and activated.
 */

function a8c_editor_assets() {
	$assets = require( plugin_dir_path( __FILE__ ) . 'dist/editor.asset.php' );

	wp_enqueue_script(
		'a8c-blocks-js',
		plugins_url( 'dist/editor.js', __FILE__ ),
		$assets['dependencies'],
		$assets['version']
	);

	wp_enqueue_style(
		'a8c-blocks-block-editor-css',
		plugins_url( 'dist/editor.css', __FILE__ ),
		array( 'wp-edit-blocks' ),
		$assets['version']
	);

}

add_action( 'enqueue_block_editor_assets', 'a8c_editor_assets' );
