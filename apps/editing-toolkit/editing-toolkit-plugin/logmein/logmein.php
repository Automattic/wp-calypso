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
	static $once = false;
	if ( ! $once ) {
		$once = true;
		add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\logmein_enqueue', 100 );
	}
}
add_action( 'init', __NAMESPACE__ . '\logmein_init' );

/**
 * Enqueue
 */
function logmein_enqueue() {
	$asset_file          = include __DIR__ . '/dist/logmein.asset.php';
	$script_dependencies = $asset_file['dependencies'];
	$version             = $asset_file['version'];

	wp_enqueue_script(
		'wpcom-logmein',
		plugins_url( 'dist/logmein.js', __FILE__ ),
		is_array( $script_dependencies ) ? $script_dependencies : array(),
		$version,
		true
	);
}

/**
 * Api
 */
function logmein_api() {
	register_rest_route(
		'wpcom/v2',
		'logmein',
		array(
			array(
				'methods'  => \WP_REST_Server::READABLE,
				'callback' => __NAMESPACE__ . '\\logmein_hosts',
			),
			'permission_callback' => '\is_user_logged_in',
		)
	);
}

/**
 * Hosts
 */
function logmein_hosts() {
	$hosts = apply_filters( 'wpcom_logmein_hosts', array() );
	return rest_ensure_response( compact( 'hosts' ) );
}
