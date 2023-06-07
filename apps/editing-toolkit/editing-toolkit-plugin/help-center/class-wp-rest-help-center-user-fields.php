<?php
/**
 * WP_REST_Help_Center_User_Fields file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

use Automattic\Jetpack\Connection\Client;

/**
 * Class WP_REST_Help_Center_User_Fields.
 */
class WP_REST_Help_Center_User_Fields extends \WP_REST_Controller {
	/**
	 * WP_REST_Help_Center_User_Fields constructor.
	 */
	public function __construct() {
		$this->namespace = 'help-center';
		$this->rest_base = '/zendesk/user-fields';
	}

	/**
	 * Register available routes.
	 */
	public function register_rest_route() {
		register_rest_route(
			$this->namespace,
			$this->rest_base,
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'update_user_fields' ),
				'permission_callback' => array( $this, 'permission_callback' ),
				'args'                => array(
					'fields' => array(
						'type'     => 'object',
						'required' => true,
					),
				),
			)
		);
	}

	/**
	 * Callback to update user fields in Zendesk
	 *
	 * @param \WP_REST_Request $request    The request sent to the API.
	 *
	 * @return WP_REST_Response
	 */
	public function update_user_fields( \WP_REST_Request $request ) {
		$body = Client::wpcom_json_api_request_as_user(
			'help/zendesk/update-user-fields',
			'2',
			array(
				'method' => 'POST',
			),
			array( 'fields' => $request['fields'] )
		);

		if ( is_wp_error( $body ) ) {
			return $body;
		}
		$response = json_decode( wp_remote_retrieve_body( $body ) );
		return rest_ensure_response( $response );
	}

	/**
	 * Callback to determine whether the user has permission to access.
	 */
	public function permission_callback() {
		return is_user_logged_in();
	}
}
