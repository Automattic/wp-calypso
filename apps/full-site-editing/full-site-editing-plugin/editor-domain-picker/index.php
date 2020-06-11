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
	// @TODO: Remove this block to enable in production
	// Constant to disable the feature for development.
	if ( ! ( defined( 'A8C_FSE_DOMAIN_PICKER_ENABLE' ) && A8C_FSE_DOMAIN_PICKER_ENABLE ) ) {
		return;
	}

	// Avoid loading assets if possible.
	if ( ! \A8C\FSE\Common\is_block_editor_screen() ) {
		return;
	}

	$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/editor-domain-picker.asset.php';
	$script_dependencies = isset( $asset_file['dependencies'] ) ? $asset_file['dependencies'] : array();
	$script_version      = isset( $asset_file['version'] ) ? $asset_file['version'] : filemtime( plugin_dir_path( __FILE__ ) . 'dist/editor-domain-picker.js' );

	wp_enqueue_script(
		'a8c-fse-editor-domain-picker-script',
		plugins_url( 'dist/editor-domain-picker.js', __FILE__ ),
		$script_dependencies,
		$script_version,
		true
	);
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_script_and_style' );
