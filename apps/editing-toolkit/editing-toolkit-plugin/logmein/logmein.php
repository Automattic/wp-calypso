<?php
/**
 * Logmein
 *
 * This module adds logmein support to the editor.
 *
 * When a user clicks on a link in the editor, if it is pointing at a mapped domain,
 * a query param of `logmein=direct` will be appended to the url. This parameter is
 * recognized by wordpress.com hosted sites and will take the user through a login flow
 * before landing them back on the original url in a logged in state.
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
	// This filter is used by wpcom to selectively choose when to enable the logmein feature.
	if ( ! apply_filters( 'wpcom_logmein_enable_etk', false ) ) {
		return;
	}

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
			'home_url' => home_url(),
		)
	);
}
