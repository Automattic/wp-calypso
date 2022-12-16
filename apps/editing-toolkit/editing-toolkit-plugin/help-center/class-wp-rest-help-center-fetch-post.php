<?php
/**
 * WP_REST_Help_Center_Fetch_Post file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

use Automattic\Jetpack\Connection\Client;

/**
 * Class WP_REST_Help_Center_Fetch_Post.
 */
class WP_REST_Help_Center_Fetch_Post extends \WP_REST_Controller {
	/**
	 * WP_REST_Help_Center_Fetch_Post constructor.
	 */
	public function __construct() {
		$this->namespace = 'help-center';
		$this->rest_base = 'fetch-post';
	}

	/**
	 * Register available routes.
	 */
	public function register_rest_route() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_post' ),
				'permission_callback' => array( $this, 'permission_callback' ),
			)
		);
	}

	/**
	 * Should return the search results
	 *
	 * @param \WP_REST_Request $request    The request sent to the API.
	 *
	 * @return WP_REST_Response
	 */
	public function get_post( \WP_REST_Request $request ) {
		$blog_id = $request['blog_id'];
		$post_id = $request['post_id'];

		$body = Client::wpcom_json_api_request_as_user(
			'/help/article/' . $blog_id . '/' . $post_id
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
