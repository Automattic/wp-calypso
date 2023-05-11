<?php
/**
 * WP_REST_Help_Center_Support_History file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

use Automattic\Jetpack\Connection\Client;

/**
 * Class WP_REST_Help_Center_Support_History.
 */
class WP_REST_Help_Center_Support_History extends \WP_REST_Controller {
	/**
	 * WP_REST_Help_Center_Support_History constructor.
	 */
	public function __construct() {
		$this->namespace = 'help-center';
		$this->rest_base = '/support-history';
	}

	/**
	 * Register available routes.
	 */
	public function register_rest_route() {
		register_rest_route(
			$this->namespace,
			$this->rest_base . '/ticket',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'support_history_ticket' ),
				'permission_callback' => 'is_user_logged_in',
				'args'                => array(
					'email' => array(
						'type' => 'string',
					),
				),
			)
		);
	}

	/**
	 * Get support history tickets through Jetpack.
	 *
	 * @param \WP_REST_Request $request Request object.
	 */
	public function support_history_ticket( $request ) {
		if ( isset( $request['email'] ) ) {
			$params = array( 'email' => $request['email'] );
		} else {
			$params = array();
		}

		$body = Client::wpcom_json_api_request_as_user(
			'/support-history/ticket?' . http_build_query( $params ),
			'2',
			array(
				'method' => 'GET',
			)
		);

		if ( is_wp_error( $body ) ) {
			return $body;
		}

		$response = json_decode( wp_remote_retrieve_body( $body ) );

		return rest_ensure_response( $response );
	}
}
