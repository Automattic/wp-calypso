<?php
/**
 * Customize the look and feel of the Site Editor on WP.com.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Enqueue block editor assets.
 */
function wpcom_site_editor_script() {
	$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/wpcom-site-editor.asset.php';
	$script_dependencies = $asset_file['dependencies'];
	$version             = $asset_file['version'];

	wp_enqueue_script(
		'wpcom-site-editor-script',
		plugins_url( 'dist/wpcom-site-editor.js', __FILE__ ),
		is_array( $script_dependencies ) ? $script_dependencies : array(),
		$version,
		true
	);
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\wpcom_site_editor_script' );
