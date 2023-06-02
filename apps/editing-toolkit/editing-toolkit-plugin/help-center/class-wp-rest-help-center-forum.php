<?php
/**
 * WP_REST_Help_Center_Forum file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

use Automattic\Jetpack\Connection\Client;

/**
 * Class WP_REST_Help_Center_Forum.
 */
class WP_REST_Help_Center_Forum extends \WP_REST_Controller {
	/**
	 * WP_REST_Help_Center_Forum constructor.
	 */
	public function __construct() {
		$this->namespace = 'help-center';
		$this->rest_base = '/forum';
	}

	/**
	 * Register available routes.
	 */
	public function register_rest_route() {
		register_rest_route(
			$this->namespace,
			$this->rest_base . '/new',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'submit_new_topic' ),
				'permission_callback' => array( $this, 'permissions_check' ),
				'args'                => array(
					'subject'                => array(
						'type'     => 'string',
						'required' => true,
					),
					'message'                => array(
						'type'     => 'string',
						'required' => true,
					),
					'blog_url'               => array(
						'type'     => 'string',
						'required' => true,
					),
					'blog_id'                => array(
						'type'    => 'integer',
						'default' => null,
					),
					'tags'                   => array(
						'type'    => 'array',
						'default' => array(),
					),
					'locale'                 => array(
						'type' => 'string',
					),
					'hide_blog_info'         => array(
						'type'    => 'boolean',
						'default' => false,
					),
					'should_use_test_forums' => array(
						'type' => 'boolean',
					),
				),
			)
		);
	}

	/**
	 * Should create a new forum topic
	 *
	 * @param \WP_REST_Request $request    The request sent to the API.
	 *
	 * @return WP_REST_Response
	 */
	public function submit_new_topic( \WP_REST_Request $request ) {
		$topic_args = array(
			'subject'                => $request['subject'],
			'message'                => $request['message'],
			'blog_url'               => $request['blog_url'],
			'blog_id'                => $request['blog_id'],
			'tags'                   => $request['tags'],
			'locale'                 => $request['locale'],
			'hide_blog_info'         => $request['hide_blog_info'],
			'should_use_test_forums' => isset( $request['should_use_test_forums'] ) && $request['should_use_test_forums'],
		);

		$body = Client::wpcom_json_api_request_as_user(
			'/help/forum/new',
			'2',
			array(
				'method' => 'POST',
			),
			$topic_args
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
	public function permissions_check() {
		return is_user_logged_in();
	}
}
