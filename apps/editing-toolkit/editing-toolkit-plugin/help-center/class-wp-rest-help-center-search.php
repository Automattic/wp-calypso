<?php
/**
 * WP_REST_Help_Center_Search file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

use Automattic\Jetpack\Connection\Client;

/**
 * Class WP_REST_Help_Center_Search.
 */
class WP_REST_Help_Center_Search extends \WP_REST_Controller {
	/**
	 * WP_REST_Help_Center_Search constructor.
	 */
	public function __construct() {
		$this->namespace = 'help-center';
		$this->rest_base = '/search';
	}

	/**
	 * Register available routes.
	 */
	public function register_rest_route() {
		register_rest_route(
			$this->namespace,
			$this->rest_base,
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_search_results' ),
				'permission_callback' => array( $this, 'permission_callback' ),
				'args'                => array(
					'query'  => array(
						'type' => 'string',
					),
					'locale' => array(
						'type'    => 'string',
						'default' => 'en',
					),
				),
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
	public function get_search_results( \WP_REST_Request $request ) {
		$query  = $request['query'];
		$locale = $request['locale'];

		$query_parameters = array(
			'query'  => $query,
			'locale' => $locale,
		);
		$body             = Client::wpcom_json_api_request_as_user(
			'/help/search/wpcom?' . http_build_query( $query_parameters )
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
