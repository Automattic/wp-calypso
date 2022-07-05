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
		$this->namespace                       = 'wpcom/v2';
		$this->rest_base                       = 'help-center/support-availability';
		$this->wpcom_is_site_specific_endpoint = false;
		$this->is_wpcom                        = false;

		if ( defined( 'IS_WPCOM' ) && IS_WPCOM ) {
			$this->is_wpcom = true;
		}
	}

	/**
	 * Register available routes.
	 */
	public function register_rest_route() {
		register_rest_route(
			$this->namespace,
			$this->rest_base . '/(?P<system>\w+)',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_support_availability' ),
					'permission_callback' => array( $this, 'permission_callback' ),
				),
			)
		);
	}

	/**
	 * Callback to determine whether the request can proceed.
	 *
	 * @return boolean
	 */
	public function permission_callback() {
		return current_user_can( 'read' );
	}

	/**
	 * Should return the support availability
	 *
	 * @param \WP_REST_Request $request    The request sent to the API.
	 *
	 * @return WP_REST_Response
	 */
	public function get_support_availability( \WP_REST_Request $request ) {
		$support_system_name = $request->get_param( 'system' );

		if ( $this->is_wpcom ) {
			$response = \WPCOM_Help_Eligibility::check_support_eligibility( $support_system_name );
		} else {
			$body = Client::wpcom_json_api_request_as_user( 'help/eligibility/' . $support_system_name . '/mine' );
			if ( is_wp_error( $body ) ) {
				return $body;
			}
			$response = json_decode( wp_remote_retrieve_body( $body ) );
		}

		return rest_ensure_response(
			array(
				'get_availability' => $response,
			)
		);
	}
}
