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

namespace A8C\FSE\EditorSiteLaunch;

/**
 * Enqueue assets
 */
function enqueue_script_and_style() {
	// Avoid loading assets if possible.
	if ( ! \A8C\FSE\Common\is_block_editor_screen() ) {
		return;
	}

	$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/editor-site-launch.asset.php';
	$script_dependencies = isset( $asset_file['dependencies'] ) ? $asset_file['dependencies'] : array();
	$script_version      = isset( $asset_file['version'] ) ? $asset_file['version'] : filemtime( plugin_dir_path( __FILE__ ) . 'dist/editor-site-launch.js' );
	$style_version       = isset( $asset_file['version'] ) ? $asset_file['version'] : filemtime( plugin_dir_path( __FILE__ ) . 'dist/editor-site-launch.css' );

	wp_enqueue_script(
		'a8c-fse-editor-site-launch-script',
		plugins_url( 'dist/editor-site-launch.js', __FILE__ ),
		$script_dependencies,
		$script_version,
		true
	);

	wp_set_script_translations( 'a8c-fse-editor-site-launch-script', 'full-site-editing' );

	wp_localize_script(
		'a8c-fse-editor-site-launch-script',
		'wpcomEditorSiteLaunch',
		array(
			'locale' => determine_locale(),
		)
	);

	$style_file = is_rtl()
		? 'editor-site-launch.rtl.css'
		: 'editor-site-launch.css';

	wp_enqueue_style(
		'a8c-fse-editor-site-launch-style',
		plugins_url( 'dist/' . $style_file, __FILE__ ),
		array(),
		$style_version
	);
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_script_and_style' );
