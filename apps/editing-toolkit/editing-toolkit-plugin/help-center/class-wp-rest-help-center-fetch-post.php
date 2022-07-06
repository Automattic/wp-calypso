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
		$this->namespace                       = 'wpcom/v2';
		$this->rest_base                       = 'help-center/fetch-post';
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
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_post' ),
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
	 * Should return the search results
	 *
	 * @param \WP_REST_Request $request    The request sent to the API.
	 *
	 * @return WP_REST_Response
	 */
	public function get_post( \WP_REST_Request $request ) {
		$blog_id = $request['blog_id'];
		$post_id = $request['post_id'];

		if ( $this->is_wpcom ) {
			require_once WP_CONTENT_DIR . '/lib/reader-site-post/class.wpcom-reader-site-post.php';
			$response = \WPCOM_Reader_Site_Post::get_site_post( $blog_id, $post_id );
		} else {
			$body = Client::wpcom_json_api_request_as_user(
				'/help/support/article/' . $blog_id . '/' . $post_id
			);
			if ( is_wp_error( $body ) ) {
				return $body;
			}
			$response = json_decode( wp_remote_retrieve_body( $body ) );
		}

		return rest_ensure_response( $response );
	}
}
