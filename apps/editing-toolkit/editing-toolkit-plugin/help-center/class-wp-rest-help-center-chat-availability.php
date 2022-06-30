<?php
/**
 * WP_REST_Help_Center_Chat_Availability file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

use Automattic\Jetpack\Connection\Client;
use Automattic\Jetpack\Constants;

/**
 * Class WP_REST_Help_Center_Chat_Availability.
 */
class WP_REST_Help_Center_Chat_Availability extends \WP_REST_Controller {
	/**
	 * WP_REST_Help_Center_Support_Availability constructor.
	 */
	public function __construct() {
		$this->namespace                       = 'wpcom/v2';
		$this->rest_base                       = 'help-center/chat-availability';
		$this->wpcom_is_site_specific_endpoint = false;
		$this->wpcom_is_wpcom_only_endpoint    = false;
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
			$this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_chat_availability' ),
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
	 * Should return the chat availability
	 *
	 * @return WP_REST_Response
	 */
	public function get_chat_availability() {
		$endpoint = 'help/eligibility/mine/chat';
		if ( $this->is_wpcom ) {
			require_lib( 'wpcom-api-direct' );
			$request          = array(
				'url'    => sprintf(
					'%s/%s/v%s/%s',
					Constants::get_constant( 'JETPACK__WPCOM_JSON_API_BASE' ),
					'wpcom',
					'2',
					$endpoint
				),
				'method' => 'GET',
			);
			$get_availability = \WPCOM_API_Direct::do_request( $request, null );
		} else {
			$get_availability = Client::wpcom_json_api_request_as_user( $endpoint );
		}

		return rest_ensure_response(
			array(
				'get_availability' => $get_availability,
			)
		);
	}
}
