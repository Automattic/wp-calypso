<?php
/**
 * WP_REST_Help_Center_Support_Availability file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

use Automattic\Jetpack\Connection;

/**
 * Class WP_REST_Help_Center_Support_Availability.
 */
class WP_REST_Help_Center_Support_Availability extends \WP_REST_Controller {
	/**
	 * WP_REST_Help_Center_Support_Availability constructor.
	 */
	public function __construct() {
		$this->namespace = 'wpcom/v2';
		$this->rest_base = 'help-center/support-availability';
	}

	/**
	 * Register available routes.
	 */
	public function register_rest_route() {
		register_rest_route(
			$this->namespace,
			$this->rest_base,
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
	 * Should we show the first post published modal
	 *
	 * @return WP_REST_Response
	 */
	public function get_support_availability() {
		$get_support_availability = Connection\Client::wpcom_json_api_request_as_user( '/help/tickets/all/mine' );

		return rest_ensure_response(
			array(
				'get_support_availability' => $get_support_availability,
			)
		);
	}
}
