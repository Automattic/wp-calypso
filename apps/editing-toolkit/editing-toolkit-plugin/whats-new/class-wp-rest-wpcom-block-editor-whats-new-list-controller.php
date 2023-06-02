<?php
/**
 * WP_REST_WPCOM_Block_Editor_Whats_New_List_Controller file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

use Automattic\Jetpack\Connection\Client;

/**
 * Class WP_REST_WPCOM_Block_Editor_Whats_New_List_Controller.
 */
class WP_REST_WPCOM_Block_Editor_Whats_New_List_Controller extends \WP_REST_Controller {
	/**
	 * WP_REST_WPCOM_Block_Editor_Whats_New_List_Controller constructor.
	 */
	public function __construct() {
		$this->namespace                       = 'wpcom/v2';
		$this->rest_base                       = 'block-editor/whats-new-list';
		$this->wpcom_is_site_specific_endpoint = false;
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
					'callback'            => array( $this, 'get_whats_new' ),
					'permission_callback' => array( $this, 'permission_callback' ),
					'args'                => array(
						'_locale' => array(
							'type'    => 'string',
							'default' => 'en',
						),
					),
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
		return is_user_logged_in();
	}

	/**
	 * Should return the whats new modal content
	 *
	 * @param \WP_REST_Request $request    The request sent to the API.
	 *
	 * @return WP_REST_Response
	 */
	public function get_whats_new( \WP_REST_Request $request ) {
		$locale = $request['_locale'];

		$query_parameters = array(
			'_locale' => $locale,
		);

		$body = Client::wpcom_json_api_request_as_user(
			'/whats-new/list?' . http_build_query( $query_parameters )
		);
		if ( is_wp_error( $body ) ) {
			return $body;
		}
		$response = json_decode( wp_remote_retrieve_body( $body ) );

		return rest_ensure_response( $response );
	}
}
