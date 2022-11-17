<?php
/**
 * WP_REST_Help_Center_Authenticate file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

use Automattic\Jetpack\Connection\Client;

/**
 * Class WP_REST_Help_Center_Authenticate.
 */
class WP_REST_Help_Center_Authenticate extends \WP_REST_Controller {
	/**
	 * WP_REST_Help_Center_Authenticate constructor.
	 */
	public function __construct() {
		$this->namespace = 'help-center';
		$this->rest_base = '/authenticate/chat';
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
				'callback'            => array( $this, 'get_chat_authentication' ),
				'permission_callback' => array( $this, 'permission_callback' ),
			)
		);
	}

	/**
	 * Callback to authorize user for chat.
	 */
	public function get_chat_authentication() {
		$body = Client::wpcom_json_api_request_as_user(
			'help/authenticate/chat',
			'2',
			array(
				'method' => 'POST',
			)
		);

		if ( is_wp_error( $body ) ) {
			return $body;
		}
		$response = json_decode( wp_remote_retrieve_body( $body ) );

		// Return happychat staging for proxied users. The URL returned from the API request is not correct when coming from atomic sites.
		$is_proxied    = isset( $_SERVER['A8C_PROXIED_REQUEST'] ) ? sanitize_text_field( wp_unslash( $_SERVER['A8C_PROXIED_REQUEST'] ) ) : false || defined( 'A8C_PROXIED_REQUEST' ) && A8C_PROXIED_REQUEST;
		$url           = $is_proxied ? 'https://happychat-io-staging.go-vip.co/customer' : 'https://happychat.io/customer';
		$response->url = $url;

		return rest_ensure_response( $response );
	}

	/**
	 * Callback to determine whether the user has permission to access.
	 */
	public function permission_callback() {
		return is_user_logged_in();
	}
}
