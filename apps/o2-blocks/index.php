<?php
/**
 * Plugin Name: A8C Blocks
 * Description: A8C Specific Blocks
 * Author: A8C
 * Text Domain: full-site-editing
 *
 * @package o2-blocks
 *
 * Instructions:
 *   1. The block code is found in Calypso in `apps/o2-blocks` - see the README there for
 *      information on how to edit and maintain them.
 *      https://github.com/Automattic/wp-calypso/tree/trunk/apps/o2-blocks
 *
 *   2. The block code is built from a TeamCity job in Calypso
 *      https://github.com/Automattic/wp-calypso/blob/a13e6ddacdf59ce5f2d6b26c22900c0f4afd1adb/.teamcity/_self/projects/WPComPlugins.kt#L107
 *
 *      It's built on every Calypso deploy. Why not just the ones where we modify o2-blocks?
 *      Changes to Calypso's components, build system, and framework may indirectly change
 *      the build of these blocks. We expect to update code here on every change to the
 *      o2-blocks code but it's safe and normal from time to time to go ahead and rebuild the
 *      blocks to capture ancillary work going on in general.
 *
 *   3. Login to your sandbox and fetch the updated block code with the install-plugins.sh script
 *
 *      ```
 *      # Prep the latest trunk build for release
 *      wpdev~/public_html# install-plugin.sh o2-blocks --release
 *
 *      # Alternatively, load changes from a branch (e.g. to test a PR.)
 *      ```
 *      wpdev~/public_html# install-plugin.sh o2-blocks $brach_name
 *      ```
 */

/**
 * Load editor assets.
 */
function a8c_editor_assets() {
	$assets = require plugin_dir_path( __FILE__ ) . 'dist/editor.asset.php';

	wp_enqueue_script(
		'a8c-blocks-js',
		plugins_url( 'dist/editor.js', __FILE__ ),
		$assets['dependencies'],
		$assets['version'],
		true
	);

	$style_file = 'dist/editor' . ( is_rtl() ? '.rtl.css' : '.css' );
	wp_enqueue_style(
		'a8c-blocks-block-editor-css',
		plugins_url( $style_file, __FILE__ ),
		array( 'wp-edit-blocks' ),
		$assets['version']
	);
}

/**
 * Load front-end view assets.
 */
function a8c_view_assets() {
	if ( ! is_admin() ) {
		$assets = require plugin_dir_path( __FILE__ ) . 'dist/view.asset.php';

		$style_file = 'dist/view' . ( is_rtl() ? '.rtl.css' : '.css' );
		wp_enqueue_style(
			'a8c-blocks-block-view-css',
			plugins_url( $style_file, __FILE__ ),
			array(),
			$assets['version']
		);
	}
}

add_action( 'enqueue_block_editor_assets', 'a8c_editor_assets' );
add_action( 'wp_enqueue_scripts', 'a8c_view_assets' );
