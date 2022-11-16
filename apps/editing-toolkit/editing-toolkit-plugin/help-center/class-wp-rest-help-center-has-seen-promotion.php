<?php
/**
 * WP_REST_Help_Center_Has_Seen_Promotion file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

use Automattic\Jetpack\Connection\Client;

/**
 * Class WP_REST_Help_Center_Has_Seen_Promotion.
 */
class WP_REST_Help_Center_Has_Seen_Promotion extends \WP_REST_Controller {
	/**
	 * WP_REST_Help_Center_Has_Seen_Promotion constructor.
	 */
	public function __construct() {
		$this->namespace = 'help-center';
		$this->rest_base = 'has-seen-promotion';
	}

	/**
	 * Register available routes.
	 */
	public function register_rest_route() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_me_preferences' ),
					'permission_callback' => array( $this, 'permission_callback' ),
				),
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'set_me_preferences' ),
					'permission_callback' => array( $this, 'permission_callback' ),
				),
			)
		);
	}

	/**
	 * Get the calypso prefernce.
	 *
	 * @return WP_REST_Response
	 */
	public function get_me_preferences() {
		$response = Client::wpcom_json_api_request_as_user(
			'/me/preferences',
			'2',
			array(
				'method' => \WP_REST_Server::READABLE,
			),
			array(
				'preference_key' => 'seen_help_center_promotion',
			)
		);

		return rest_ensure_response( $response );
	}

	/**
	 * Set the calypso prefernce.
	 *
	 * @return WP_REST_Response
	 */
	public function set_me_preferences() {
		$response = Client::wpcom_json_api_request_as_user(
			'/me/preferences',
			'2',
			array(
				'method' => \WP_REST_Server::EDITABLE,
			),
			array(
				'calypso_preferences' => array( 'seen_help_center_promotion' => true ),
			)
		);

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
