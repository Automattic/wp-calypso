<?php
/**
 * Block Inserter Modifications
 *
 * @package A8C\FSE
 */

namespace A8C\FSE\Block_Inserter_Modifications;

use RuntimeException;

/**
 * Enqueues a submodule script by its filename.
 *
 * @param string  $filename Name of the script file w/o extension.
 * @param boolean $in_footer Whether to enqueue the script before </body> instead of in the <head> (optional).
 *
 * @throws RuntimeException If the asset file doesn't exist.
 */
function enqueue_script( $filename, $in_footer = false ) {
	$asset_path = __DIR__ . '/dist/' . $filename . '.asset.php';

	if ( ! file_exists( $asset_path ) ) {
		throw new RuntimeException(
			'Asset file not found: ' . $asset_path . '. ' .
			'Please see https://github.com/Automattic/wp-calypso/blob/master/apps/full-site-editing/README.md#build-system ' .
			'for more information about the Full Site Editing build system.'
		);
	}

	$asset = require_once $asset_path;

	wp_enqueue_script(
		$filename,
		plugins_url( 'dist/' . $filename . '.js', __FILE__ ),
		$asset['dependencies'],
		$asset['version'],
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
	enqueue_script( 'index', false );
}

add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_new_blocks_showcase_script', 0 );
