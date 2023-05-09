<?php
/**
 * WP_REST_Help_Center_Ticket file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

use Automattic\Jetpack\Connection\Client;

/**
 * Class WP_REST_Help_Center_Ticket.
 */
class WP_REST_Help_Center_Ticket extends \WP_REST_Controller {
	/**
	 * WP_REST_Help_Center_Ticket constructor.
	 */
	public function __construct() {
		$this->namespace = 'help-center';
		$this->rest_base = '/ticket';
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
				'callback'            => array( $this, 'new_ticket' ),
				'permission_callback' => array( $this, 'permission_callback' ),
				'args'                => array(
					'subject'          => array(
						'type' => 'string',
					),
					'message'          => array(
						'type' => 'string',
					),
					'locale'           => array(
						'type'    => 'string',
						'default' => 'en',
					),
					'is_chat_overflow' => array(
						'type' => 'boolean',
					),
					'source'           => array(
						'type' => 'string',
					),
					'blog_url'         => array(
						'type' => 'string',
					),
				),
			)
		);
	}

	/**
	 * Should create a new ticket
	 *
	 * @param \WP_REST_Request $request    The request sent to the API.
	 *
	 * @return WP_REST_Response
	 */
	public function new_ticket( \WP_REST_Request $request ) {
		$ticket = array(
			'subject'          => $request['subject'],
			'message'          => $request['message'],
			'locale'           => $request['locale'],
			'is_chat_overflow' => $request['is_chat_overflow'],
			'source'           => $request['source'],
			'blog_url'         => $request['blog_url'],
		);

		$body = Client::wpcom_json_api_request_as_user(
			'/help/ticket/new',
			'2',
			array(
				'method' => 'POST',
			),
			$ticket
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
