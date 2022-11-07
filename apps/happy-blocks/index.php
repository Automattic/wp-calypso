<?php
/**
 * Plugin Name: Happy Blocks
 * Version:     0.1.0
 * Description: Happyness Engineering Specific Blocks
 * Author: A8C
 * Text Domain: full-site-editing
 *
 * @package happy-blocks
 *
 * Instructions:
 *   1. The block code is found in Calypso in `apps/happy-blocks` - see the README there for
 *      information on how to edit and maintain them.
 *      https://github.com/Automattic/wp-calypso/tree/trunk/apps/happy-blocks
 *
 *   2. The block code is built from a TeamCity job in Calypso
 *
 *      https://github.com/Automattic/wp-calypso/blob/813bc5bc8a5e21593f05a68c76b02b9827a680f1/.teamcity/_self/projects/WPComPlugins.kt#L116
 *
 *      It's built on every Calypso deploy. Why not just the ones where we modify happy-blocks?
 *      Changes to Calypso's components, build system, and framework may indirectly change
 *      the build of these blocks. We expect to update code here on every change to the
 *      happy-blocks code but it's safe and normal from time to time to go ahead and rebuild the
 *      blocks to capture ancillary work going on in general.
 *
 *   3. Login to your sandbox and fetch the updated block code with the install-plugins.sh script
 *
 *      ```
 *      # Prep the latest trunk build for release
 *      wpdev~/public_html# install-plugin.sh happy-blocks --release
 *
 *      # Alternatively, load changes from a branch (e.g. to test a PR.)
 *      ```
 *      wpdev~/public_html# install-plugin.sh happy-blocks $brach_name
 *      ```
 */

/**
 * Load editor assets.
 */
function a8c_happyblocks_assets() {
	$assets = require plugin_dir_path( __FILE__ ) . 'dist/editor.min.asset.php';

	wp_enqueue_script(
		'a8c-happyblocks-js',
		plugins_url( 'dist/editor.min.js', __FILE__ ),
		$assets['dependencies'],
		$assets['version'],
		true
	);

	$style_file = 'dist/editor' . ( is_rtl() ? '.rtl.css' : '.css' );
	wp_enqueue_style(
		'a8c-happyblocks-css',
		plugins_url( $style_file, __FILE__ ),
		array( 'wp-edit-blocks' ),
		$assets['version']
	);
}

/**
 * Load front-end view assets.
 */
function a8c_happyblocks_view_assets() {
	if ( ! is_admin() ) {
		$assets = require plugin_dir_path( __FILE__ ) . 'dist/view.min.asset.php';

		$style_file = 'dist/view' . ( is_rtl() ? '.rtl.css' : '.css' );
		wp_enqueue_style(
			'a8c-happyblocks-css',
			plugins_url( $style_file, __FILE__ ),
			array(),
			$assets['version']
		);
	}
}

add_action( 'enqueue_block_editor_assets', 'a8c_happyblocks_assets' );
add_action( 'wp_enqueue_scripts', 'a8c_happyblocks_view_assets' );
