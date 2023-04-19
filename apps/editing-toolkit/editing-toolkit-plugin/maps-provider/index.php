<?php
/**
 * Map provider
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Adds a global variable containing the map provider to the window object
 *
 * @return void
 */
function set_map_provider() {
	$map_provider = apply_filters( 'wpcom_map_block_map_provider', 'mapbox' );

	wp_register_script( 'dummy-script', '', array(), '1.0', false );
	wp_localize_script( 'dummy-script', 'map_block_map_provider', $map_provider );
	wp_enqueue_script( 'dummy-script', '', array(), '1.0', false );
}

add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\set_map_provider' );
