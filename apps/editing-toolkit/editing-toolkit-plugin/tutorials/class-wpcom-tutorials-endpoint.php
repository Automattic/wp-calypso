<?php
/**
 * Tutorials endpoint (Think: "Guided Tours").
 *
 * @package A8C\FSE
 */

/**
 * WPCom_Tutorials_Controller class
 */
class WPCom_Tutorials_Endpoint extends WP_REST_Controller {

	/**
	 * Namespace.
	 *
	 * @var string
	 */
	public $namespace = 'wpcom/v2';

	/**
	 * Rest base.
	 *
	 * @var string
	 */
	public $rest_base = 'tutorials';

	/**
	 * Whether this is a site-specific endpoint.
	 *
	 * @var bool
	 */
	public $wpcom_is_site_specific_endpoint = false;

	/**
	 * Callback for registering our REST routes
	 */
	public function register_rest_routes() {
		register_rest_route(
			$this->namespace,
			$this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_tutorials' ),
					'permission_callback' => 'is_user_logged_in',
				),
			)
		);

		register_rest_route(
			$this->namespace,
			$this->rest_base . '/(?P<tutorial_id>[\w-]+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_tutorial' ),
					'permission_callback' => 'is_user_logged_in',
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_tutorial' ),
					'permission_callback' => 'is_user_logged_in',
					'args'                => $this->get_collection_params(),
				),
			)
		);
	}

	/**
	 * Callback for the `/tutorials` endpoint
	 *
	 * @return WP_REST_Response
	 */
	public function get_tutorials() {
		$tutorials = wpcom_get_registered_tutorial_ids();
		return rest_ensure_response( compact( 'tutorials' ) );
	}

	/**
	 * Callback for the GET `/tutorials/TUTORIAL_ID` endpoint
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function get_tutorial( $request ) {
		$tutorial_id = $request['tutorial_id'];
		$tutorial    = wpcom_get_tutorial( $tutorial_id );
		return rest_ensure_response( $tutorial );
	}

	/**
	 * Callback for the PUT `/tutorials/TUTORIAL_ID` endpoint
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function update_tutorial( $request ) {
		$tutorial_id = $request['tutorial_id'];
		$params      = $request->get_json_params();
		$task        = $params['task'];

		$success = wpcom_tutorial_mark_task( $tutorial_id, $task['id'], $task['status'] );
		if ( ! $success ) {
			return new WP_Error( 404, sprintf( 'The task with ID `%s` could not be updated', $task['id'] ) );
		}
		$tutorial = wpcom_get_tutorial( $tutorial_id );
		// Although we should have already errored above if the Tutorial isn't registered, you never know.
		if ( ! $tutorial ) {
			return new WP_Error( 404, sprintf( 'The tutorial ID `%s` was not found', $tutorial_id ) );
		}
		// Success!
		return rest_ensure_response( $tutorial );
	}
}
