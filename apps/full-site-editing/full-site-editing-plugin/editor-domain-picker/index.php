<?php
/**
 * File for various functionality which needs to be added to Simple and Atomic
 * sites. The code in this file is always loaded in the block editor.
 *
 * Currently, this module may not be the best place if you need to load
 * front-end assets, but you could always add a separate action for that.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE\EditorDomainPicker;

/**
 * Enqueue assets
 */
function enqueue_script_and_style() {
	// Avoid loading assets if possible.
	if ( ! \A8C\FSE\Common\is_block_editor_screen() ) {
		return;
	}

	$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/editor-domain-picker.asset.php';
	$script_dependencies = isset( $asset_file['dependencies'] ) ? $asset_file['dependencies'] : array();
	$script_version      = isset( $asset_file['version'] ) ? $asset_file['version'] : filemtime( plugin_dir_path( __FILE__ ) . 'dist/editor-domain-picker.js' );
	$styles_version      = isset( $asset_file['version'] ) ? $asset_file['version'] : filemtime( plugin_dir_path( __FILE__ ) . 'dist/editor-domain-picker.css' );

	wp_enqueue_script(
		'a8c-fse-editor-domain-picker-script',
		plugins_url( 'dist/editor-domain-picker.js', __FILE__ ),
		$script_dependencies,
		$script_version,
		true
	);

	wp_enqueue_style(
		'a8c-fse-editor-domain-picker-styles',
		plugins_url( 'dist/editor-domain-picker.css', __FILE__ ),
		array(),
		$styles_version
	);
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_script_and_style' );
