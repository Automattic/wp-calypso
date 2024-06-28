<?php
/**
 * WP_REST_Help_Center_Odie file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

use Automattic\Jetpack\Connection\Client;

/**
 * Class WP_REST_Help_Center_Odie.
 */
class WP_REST_Help_Center_Odie extends \WP_REST_Controller {

	/**
	 * WP_REST_Help_Center_Odie constructor.
	 */
	public function __construct() {
		$this->namespace = 'help-center';
		$this->rest_base = '/odie';
	}

	/**
	 * Register available routes.
	 */
	public function register_rest_route() {
		register_rest_route(
			$this->namespace,
			$this->rest_base . '/chat/(?P<bot_id>[a-zA-Z0-9-]+)/(?P<chat_id>\d+)',
			array(
				// Get a chat. Supports pagination of messages.
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_chat' ),
					'permission_callback' => array( $this, 'permission_callback' ),
					'args'                => array(
						'bot_id'           => array(
							'description' => __( 'The bot id to get the chat for.', 'full-site-editing' ),
							'type'        => 'string',
							'required'    => true,
						),
						'chat_id'          => array(
							'description' => __( 'The chat id to get the chat for.', 'full-site-editing' ),
							'type'        => 'integer',
							'required'    => true,
						),
						'page_number'      => array(
							'description' => __( 'The number of the page to retrieve, limited to 100', 'full-site-editing' ),
							'type'        => 'integer',
							'required'    => false,
							'default'     => 1,
						),
						'items_per_page'   => array(
							'description' => __( 'The number of items per page.', 'full-site-editing' ),
							'type'        => 'integer',
							'required'    => false,
							'default'     => 10,
						),
						'include_feedback' => array(
							'required'    => false,
							'type'        => 'boolean',
							'description' => __( 'If true, include the feedback rating value for each message in the response.', 'full-site-editing' ),
						),
					),
				),
				// Add a message to a chat.
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'send_chat_message' ),
					'permission_callback' => array( $this, 'permission_callback' ),
					'args'                => array(
						'bot_id'  => array(
							'description' => __( 'The bot id to chat with.', 'full-site-editing' ),
							'type'        => 'string',
							'required'    => true,
						),
						'chat_id' => array(
							'description' => __( 'The chat id for the existing chat.', 'full-site-editing' ),
							'type'        => 'integer',
							'required'    => true,
						),
						'message' => array(
							'description' => __( 'The message to add to the chat', 'full-site-editing' ),
							'type'        => 'string',
							'required'    => true,
						),
						// an arbitray key/value object of data to pass to the bot
						'context' => array(
							'description' => __( 'The context to continue the chat with.', 'full-site-editing' ),
							'type'        => 'object',
							'required'    => false,
						),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			$this->rest_base . '/history/last-chat-id',
			// Get last chat ID.
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_last_chat_id' ),
					'permission_callback' => array( $this, 'permission_callback' ),
				),
				// Set last chat ID.
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'set_last_chat_id' ),
					'permission_callback' => array( $this, 'permission_callback' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			$this->rest_base . '/chat/(?P<bot_id>[a-zA-Z0-9-]+)/(?P<chat_id>\d+)/(?P<message_id>\d+)/feedback',
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'save_chat_message_feedback' ),
					'permission_callback' => array( $this, 'permission_callback' ),
					'args'                => array(
						'bot_id'       => array(
							'description' => __( 'The bot id to chat with.', 'full-site-editing' ),
							'type'        => 'string',
							'required'    => true,
						),
						'chat_id'      => array(
							'description' => __( 'The chat id for the existing chat.', 'full-site-editing' ),
							'type'        => 'integer',
							'required'    => true,
						),
						'message_id'   => array(
							'description' => __( 'The message id for the existing message.', 'full-site-editing' ),
							'type'        => 'integer',
							'required'    => true,
						),
						'rating_value' => array(
							'description' => __( 'The feedback rating value.', 'full-site-editing' ),
							'type'        => 'integer',
							'required'    => true,
						),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			$this->rest_base . '/chat/(?P<bot_id>[a-zA-Z0-9-]+)',
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'send_chat_message' ),
					'permission_callback' => array( $this, 'permission_callback' ),
					'args'                => array(
						'bot_id'  => array(
							'description' => __( 'The bot id to chat with.', 'full-site-editing' ),
							'type'        => 'string',
							'required'    => true,
						),
						'context' => array(
							'description' => __( 'The context to continue the chat with.', 'full-site-editing' ),
							'type'        => 'object',
							'required'    => false,
						),
						'message' => array(
							'description' => __( 'The message to add to the chat', 'full-site-editing' ),
							'type'        => 'string',
							'required'    => true,
						),
						'test'    => array(
							'description' => __( 'Whether to mark this as a test chat (a11n-only).', 'full-site-editing' ),
							'type'        => 'boolean',
							'required'    => false,
						),
					),
				),
			)
		);
	}

	/**
	 * Get chat_id and last_chat_id from user preferences.
	 *
	 * @return WP_REST_Response
	 */
	public function get_last_chat_id() {
		// Forward the request body to the support chat endpoint.
		$body = Client::wpcom_json_api_request_as_user(
			'/me/preferences',
			2,
			array( 'method' => 'GET' )
		);

		if ( is_wp_error( $body ) ) {
			return $body;
		}

		$response = json_decode( wp_remote_retrieve_body( $body ) );

		$projected_response = array(
			'odie_chat_id'      => $response->odie_chat_id,
			'odie_last_chat_id' => $response->odie_last_chat_id,
		);

		return rest_ensure_response( $projected_response );
	}

	/**
	 * Set chat_id or last_chat_id from user preferences.
	 *
	 * @param \WP_REST_Request $request The request sent to the API.
	 *
	 * @return WP_REST_Response
	 */
	public function set_last_chat_id( \WP_REST_Request $request ) {
		$chat_id      = $request['odie_chat_id'];
		$last_chat_id = $request['odie_last_chat_id'];

		$data = array(
			'calypso_preferences' => array(),
		);

		if ( $request->has_param( 'odie_chat_id' ) ) {
			$data['calypso_preferences']['odie_chat_id'] = $chat_id;
		}

		if ( $request->has_param( 'odie_last_chat_id' ) ) {
			$data['calypso_preferences']['odie_last_chat_id'] = $last_chat_id;
		}

		$body = Client::wpcom_json_api_request_as_user(
			'/me/preferences',
			2,
			array( 'method' => 'POST' ),
			$data
		);

		if ( is_wp_error( $body ) ) {
			return $body;
		}

		$response = json_decode( wp_remote_retrieve_body( $body ) );

		$projected_response = array(
			'calypso_preferences' => array(
				'odie_chat_id'      => $response->calypso_preferences->odie_chat_id,
				'odie_last_chat_id' => $response->calypso_preferences->odie_last_chat_id,
			),
		);

		return rest_ensure_response( $projected_response );
	}

	/**
	 * Send a message to the support chat.
	 *
	 * @param \WP_REST_Request $request The request sent to the API.
	 *
	 * @return WP_REST_Response
	 */
	public function send_chat_message( \WP_REST_Request $request ) {
		$bot_name_slug = $request->get_param( 'bot_id' );
		$chat_id       = $request->get_param( 'chat_id' );

		// Forward the request body to the support chat endpoint.
		$body = Client::wpcom_json_api_request_as_user(
			'/odie/chat/' . $bot_name_slug . '/' . $chat_id,
			2,
			array(
				'method'  => 'POST',
				'timeout' => 30,
			),
			array(
				'message' => $request->get_param( 'message' ),
				'context' => $request->get_param( 'context' ) ?? array(),
				'version' => $request->get_param( 'version' ) ?? null,
			)
		);

		if ( is_wp_error( $body ) ) {
			return $body;
		}

		$response = json_decode( wp_remote_retrieve_body( $body ) );

		return rest_ensure_response( $response );
	}

	/**
	 * Get the chat messages.
	 *
	 * @param \WP_REST_Request $request The request sent to the API.
	 *
	 * @return WP_REST_Response
	 */
	public function get_chat( \WP_REST_Request $request ) {
		$bot_name_slug    = $request->get_param( 'bot_id' );
		$chat_id          = $request->get_param( 'chat_id' );
		$page_number      = $request['page_number'];
		$items_per_page   = $request['items_per_page'];
		$include_feedback = $request['include_feedback'];

		$url_query_params = http_build_query(
			array(
				'page_number'      => $page_number,
				'items_per_page'   => $items_per_page,
				'include_feedback' => $include_feedback,
			)
		);

		$body = Client::wpcom_json_api_request_as_user(
			'/odie/chat/' . $bot_name_slug . '/' . $chat_id . '?' . $url_query_params
		);

		if ( is_wp_error( $body ) ) {
			return $body;
		}

		$response = json_decode( wp_remote_retrieve_body( $body ) );

		return rest_ensure_response( $response );
	}

	/**
	 * Save feedback for a chat message.
	 *
	 * @param \WP_REST_Request $request The request sent to the API.
	 *
	 * @return WP_REST_Response
	 */
	public function save_chat_message_feedback( \WP_REST_Request $request ) {
		$bot_id       = $request->get_param( 'bot_id' );
		$chat_id      = $request->get_param( 'chat_id' );
		$message_id   = $request->get_param( 'message_id' );
		$rating_value = $request->get_param( 'rating_value' );

		// Forward the request body to the feedback endpoint.
		$body = Client::wpcom_json_api_request_as_user(
			'/odie/chat/' . $bot_id . '/' . $chat_id . '/' . $message_id . '/feedback',
			2,
			array( 'method' => 'POST' ),
			array(
				'rating_value' => $rating_value,
			)
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
