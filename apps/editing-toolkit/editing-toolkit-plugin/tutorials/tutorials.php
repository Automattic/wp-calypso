<?php
/**
 * Tutorials API
 *
 * @package A8C\FSE
 */

// Load the class we use. We also need this comment here to mollify PHPCS.
require_once __DIR__ . '/class-wpcom-tutorials.php';

/**
 * Helper function to return a WPCom_Tutorials object
 *
 * @return WPCom_Tutorials instance object.
 */
function wpcom_tutorials() {
	return WPCom_Tutorials::get_instance();
}

/**
 * Registers a Tutorial.
 *
 * @param string $tutorial_id  A unique ID for the Tutorial.
 * @param array  $options {
 *   Options for the Tutorial with the following shape.
 *
 *   @type string $title The displayed title for this Tutorial.
 *   @type array  $tasks {
 *      An array of $tasks.
 *
 *      @type array $task {
 *          @type string $id    A unique identifier for the Task.
 *          @type string $title What is displayed as the Task.
 *      }
 *   }
 * }
 *
 * @return bool True if successfully registered, false if it failed.
 */
function wpcom_register_tutorial( $tutorial_id, $options ) {
	return wpcom_tutorials()->register( $tutorial_id, $options );
}

/**
 * Retrieves a Tutorial from the registry.
 *
 * @param string $tutorial_id  The ID of the Tutorial to fetch.
 * @return null|array Tutorial associative array if found, null if not.
 */
function wpcom_get_tutorial( $tutorial_id ) {
	return wpcom_tutorials()->get_tutorial( $tutorial_id );
}

/**
 * Marks a task with a status.
 *
 * @param string $tutorial_id Tutorial ID.
 * @param string $task_id     Task ID.
 * @param string $status      Status for the task. Allowed: complete|skipped|pending.
 * @return bool               True if status is updated, false otherwise.
 */
function wpcom_tutorial_mark_task( $tutorial_id, $task_id, $status ) {
	return wpcom_tutorials()->mark_task( $tutorial_id, $task_id, $status );
}

/**
 * Retrives all registered Tutorial IDs
 *
 * @return array list of registered Tutorial IDs.
 */
function wpcom_get_registered_tutorial_ids() {
	return wpcom_tutorials()->get_registered_ids();
}

/**
 * Callback for registering the Tutorials endpoint.
 */
function wpcom_register_tutorials_endpoints() {
	$endpoint_file = __DIR__ . '/class-wpcom-tutorials-endpoint.php';
	if ( file_exists( $endpoint_file ) ) {
		require_once $endpoint_file;
		$tutorials_endpoint = new WPCom_Tutorials_Endpoint();
		$tutorials_endpoint->register_rest_routes();
	}

}
add_action( 'rest_api_init', 'wpcom_register_tutorials_endpoints' );
