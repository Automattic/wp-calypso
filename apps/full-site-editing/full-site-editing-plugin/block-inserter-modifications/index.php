<?php
/**
 * Block Inserter Modifications
 *
 * @package A8C\FSE
 */

namespace A8C\FSE\BLOCK_INSERTER_MODIFICATIONS;

/**
 * Enqueues a submodule script by its filename.
 *
 * @param string  $filename Name of the script file w/o extension.
 * @param boolean $in_footer Whether to enqueue the script before </body> instead of in the <head> (optional).
 */
function enqueue_script( $filename, $in_footer = false ) {
	$asset_file   = __DIR__ . '/dist/' . $filename . '.asset.php';
	$asset        = file_exists( $asset_file ) ? require_once $asset_file : null;
	$dependencies = isset( $asset['dependencies'] ) ? $asset['dependencies'] : array();
	$version      = isset( $asset['version'] ) ? $asset['version'] : filemtime( __DIR__ . '/' . $filename . '.js' );

	wp_enqueue_script(
		$filename,
		plugins_url( 'dist/' . $filename . '.js', __FILE__ ),
		$dependencies,
		$version,
		$in_footer
	);
}

/**
 * Enqueue script for the New Blocks Showcase submodule.
 */
function enqueue_new_blocks_showcase_script() {
	/**
	 * We're enqueuing the script in the head because we need it to run before any
	 * blocks are registered, so they're all available for filter that sets the
	 * "New" category.
	 */
	enqueue_script( 'new-blocks-showcase', false );
}

add_action( 'init', __NAMESPACE__ . '\enqueue_new_blocks_showcase_script' );
