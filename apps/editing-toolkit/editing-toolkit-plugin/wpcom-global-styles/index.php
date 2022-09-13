<?php
/**
 * Limit Global Styles on WP.com to paid plans.
 *
 * @package full-site-editing-plugin
 */

/**
 * Enqueues the WP.com Global Styles assets for the editor.
 *
 * @return void
 */
function wpcom_enqueue_global_styles_editor_assets() {
	$screen = get_current_screen();
	if ( ! $screen || $screen->id !== 'site-editor' ) {
		return;
	}

	$asset_file   = plugin_dir_path( __FILE__ ) . 'dist/wpcom-global-styles.asset.php';
	$asset        = file_exists( $asset_file )
		? require $asset_file
		: null;
	$dependencies = isset( $asset['dependencies'] ) ?
		$asset['dependencies'] :
		array();
	$version      = isset( $asset['version'] ) ?
		$asset['version'] :
		filemtime( plugin_dir_path( __FILE__ ) . 'dist/wpcom-global-styles.min.js' );

	wp_enqueue_script(
		'wpcom-global-styles-editor',
		plugins_url( 'dist/wpcom-global-styles.min.js', __FILE__ ),
		$dependencies,
		$version,
		true
	);
	wp_set_script_translations( 'wpcom-global-styles-editor', 'full-site-editing' );
	/*wp_enqueue_style(
		'jetpack-global-styles-editor-style',
		plugins_url( 'dist/global-styles.css', __FILE__ ),
		array(),
		filemtime( plugin_dir_path( __FILE__ ) . 'dist/global-styles.css' )
	);*/
}
add_action( 'enqueue_block_editor_assets', 'wpcom_enqueue_global_styles_editor_assets' );
