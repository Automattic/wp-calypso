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

	wp_register_script( 'map-block-map-provider', '', array(), '1.0', true );
	wp_localize_script( 'map-block-map-provider', 'map_block_map_provider', $map_provider );
	wp_enqueue_script( 'map-block-map-provider', '', array(), '1.0', true );
}

add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\set_map_provider' );
