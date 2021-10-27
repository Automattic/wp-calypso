<?php
/**
 * Global FSE Config initialisation for simple sites and Atomic.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE\Config;

/**
 * Enqueue assets
 */
function enqueue_script() {
	$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/config.asset.php';
	$script_dependencies = isset( $asset_file['dependencies'] ) ? $asset_file['dependencies'] : array();
	$script_version      = isset( $asset_file['version'] ) ? $asset_file['version'] : filemtime( plugin_dir_path( __FILE__ ) . 'dist/config.js' );

	wp_enqueue_script(
		'a8c-fse-config-init',
		plugins_url( 'dist/config.js', __FILE__ ),
		$script_dependencies,
		$script_version,
		true
	);
}

/**
 * Effectivelly initialises config by setting the necessary hooks.
 */
function activate_config_initialisation() {
    // 'init' to enqueue this early
	add_action( 'init', __NAMESPACE__ . '\enqueue_script', 0 );
}

activate_config_initialisation();
