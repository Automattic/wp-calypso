<?php
/**
 * Logmein
 *
 * @package A8C\FSE
 */

namespace A8C\FSE\Logmein;

/**
 * Init
 */
function logmein_init() {
	add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\logmein_enqueue', 100 );
}
add_action( 'init', __NAMESPACE__ . '\logmein_init' );

/**
 * Enqueue
 */
function logmein_enqueue() {
	$assets       = include __DIR__ . '/dist/logmein.asset.php';
	$dependencies = isset( $assets['dependencies'] ) ? $assets['dependencies'] : array();
	$version      = isset( $assets['version'] ) ? $assets['version'] : filemtime( __DIR__ . '/index.ts' );

	wp_enqueue_script(
		'wpcom-logmein',
		plugins_url( 'dist/logmein.js', __FILE__ ),
		$dependencies,
		$version,
		true
	);
	wp_localize_script(
		'wpcom-logmein',
		'wpcomLogmeinData',
		array(
			'enabled'  => apply_filters( 'wpcom_logmein_enable_etk', false ),
			'home_url' => home_url(),
		)
	);
}
