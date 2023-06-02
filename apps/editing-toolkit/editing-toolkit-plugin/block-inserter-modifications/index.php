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
			'Please see https://github.com/Automattic/wp-calypso/blob/HEAD/apps/editing-toolkit/README.md#build-system ' .
			'for more information about the Full Site Editing build system.'
		);
	}

	$asset = require $asset_path;

	wp_enqueue_script(
		$filename,
		plugins_url( 'dist/' . $filename . '.min.js', __FILE__ ),
		$asset['dependencies'],
		$asset['version'],
		$in_footer
	);
	wp_set_script_translations( $filename, 'full-site-editing' );
}

/**
 * Enqueues a submodule style by its filename.
 *
 * @param string $filename  Name of the style file w/o extension.
 */
function enqueue_style( $filename ) {
	$style_file = is_rtl()
		? $filename . '.rtl.css'
		: $filename . '.css';

	wp_enqueue_style(
		$filename,
		plugins_url( 'dist/' . $style_file, __FILE__ ),
		array(),
		filemtime( plugin_dir_path( __FILE__ ) . 'dist/' . $style_file )
	);
}

/**
 * Enqueue script for the Block Inserter modifications.
 */
function enqueue_block_inserter_modifications() {
	enqueue_script( 'contextual-tips', true );
	enqueue_style( 'contextual-tips', false );
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_block_inserter_modifications', 0 );
