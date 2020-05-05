<?php
/**
 * New Blocks Showcase
 *
 * @package A8C\FSE
 */

add_action(
	'init',
	function () {
		$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/new-blocks-showcase.asset.php';
		$script_dependencies = $asset_file['dependencies'];

		wp_enqueue_script(
			'new-blocks-showcase',
			plugins_url( 'dist/new-blocks-showcase.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : array(),
			filemtime( plugins_url( 'index.js', __FILE__ ) ),
			false // We need this script before any blocks are registered.
		);
	}
);
