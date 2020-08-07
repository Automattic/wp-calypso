<?php
/**
 * Plans grid for block editor.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE\EditorPlansGrid;

/**
 * Enqueue assets
 */
function enqueue_script_and_style() {
	// Avoid loading assets if possible.
	if ( ! \A8C\FSE\Common\is_block_editor_screen() ) {
		return;
	}

	$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/editor-plans-grid.asset.php';
	$script_dependencies = isset( $asset_file['dependencies'] ) ? $asset_file['dependencies'] : array();
	$script_version      = isset( $asset_file['version'] ) ? $asset_file['version'] : filemtime( plugin_dir_path( __FILE__ ) . 'dist/editor-plans-grid.js' );
	$styles_version      = isset( $asset_file['version'] ) ? $asset_file['version'] : filemtime( plugin_dir_path( __FILE__ ) . 'dist/editor-plans-grid.css' );

	wp_enqueue_script(
		'a8c-fse-editor-plans-grid-script',
		plugins_url( 'dist/editor-plans-grid.js', __FILE__ ),
		$script_dependencies,
		$script_version,
		true
	);

	wp_enqueue_style(
		'a8c-fse-editor-plans-grid-styles',
		plugins_url( 'dist/editor-plans-grid.css', __FILE__ ),
		array(),
		$styles_version
	);
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_script_and_style' );
