<?php
/**
 * WP_REST_Help_Center_Support_Availability file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

use Automattic\Jetpack\Connection\Client;

/**
 * Class WP_REST_Help_Center_Support_Availability.
 */
class WP_REST_Help_Center_Support_Availability extends \WP_REST_Controller {
	/**
	 * WP_REST_Help_Center_Support_Availability constructor.
	 */
	public function __construct() {
		$this->namespace = 'help-center';
		$this->rest_base = '/support-availability';
	}

	/**
	 * Register available routes.
	 */
	public function register_rest_route() {
		register_rest_route(
			$this->namespace,
			$this->rest_base . '/all',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_all_support_eligibility' ),
				'permission_callback' => array( $this, 'permission_callback' ),
			)
		);

		register_rest_route(
			$this->namespace,
			$this->rest_base . '/chat',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_chat_support_eligibility' ),
				'permission_callback' => array( $this, 'permission_callback' ),
			)
		);

		register_rest_route(
			$this->namespace,
			$this->rest_base . '/messaging',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_messaging_support_eligibility' ),
				'permission_callback' => array( $this, 'permission_callback' ),
				'args'                => array(
					'group'       => array(
						'type'     => 'string',
						'required' => true,
					),
					'environment' => array(
						'type'     => 'string',
						'required' => true,
					),
				),
			)
		);
	}

	/**
	 * Should return the chat eligibility
	 *
	 * @return WP_REST_Response
	 */
	public function get_chat_support_eligibility() {
		$body = Client::wpcom_json_api_request_as_user( 'help/eligibility/chat/mine' );
		if ( is_wp_error( $body ) ) {
			return $body;
		}
		$response = json_decode( wp_remote_retrieve_body( $body ) );

		return rest_ensure_response( $response );
	}

	/**
	 * Should return the support eligibility
	 *
	 * @return WP_REST_Response
	 */
	public function get_all_support_eligibility() {
		$body = Client::wpcom_json_api_request_as_user( 'help/eligibility/all/mine' );
		if ( is_wp_error( $body ) ) {
			return $body;
		}
		$response = json_decode( wp_remote_retrieve_body( $body ) );

		return rest_ensure_response( $response );
	}

	/**
	 * Should return messaging eligibility
	 *
	 * @param \WP_REST_Request $request    The request sent to the API.
	 *
	 * @return WP_REST_Response
	 */
	public function get_messaging_support_eligibility( \WP_REST_Request $request ) {
		$query_parameters = array(
			'group'       => $request['group'],
			'environment' => $request['environment'],
		);
		$body             = Client::wpcom_json_api_request_as_user( 'help/messaging/is-available?' . http_build_query( $query_parameters ) );
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
