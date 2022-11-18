<?php
/**
 * WP_REST_Help_Center_Sibyl file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

use Automattic\Jetpack\Connection\Client;

/**
 * Class WP_REST_Help_Center_Sibyl.
 */
class WP_REST_Help_Center_Sibyl extends \WP_REST_Controller {
	/**
	 * WP_REST_Help_Center_Sibyl constructor.
	 */
	public function __construct() {
		$this->namespace = 'help-center';
		$this->rest_base = '/sibyl';
	}

	/**
	 * Register available routes.
	 */
	public function register_rest_route() {
		register_rest_route(
			$this->namespace,
			$this->rest_base,
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_sibyl_questions' ),
				'permission_callback' => array( $this, 'permission_callback' ),
			)
		);
	}

	/**
	 * Should return the sibyl articles.
	 *
	 * @param \WP_REST_Request $request The request sent to the API.
	 *
	 * @return WP_REST_Response
	 */
	public function get_sibyl_questions( \WP_REST_Request $request ) {
		$query = $request['query'];
		$site  = $request['site'];

		$body = Client::wpcom_json_api_request_as_user(
			'/help/sibyl?query=' . $query . '&site=' . $site
		);

		if ( is_wp_error( $body ) ) {
			return $body;
		}

		$response = json_decode( wp_remote_retrieve_body( $body ) );

		return rest_ensure_response( $response );
	}

	/**
	 * Callback to determine whether the request can proceed.
	 *
	 * @return boolean
	 */
	public function permission_callback() {
		return is_user_logged_in();
	}
}
