<?php
/**
 * Tutorials (We would have called them Guided Tours but it's been done).
 *
 * Each Tutorial contains a flat list of Tasks. Each Task may contain several Steps in
 * a `WpcomTourKit` component on the frontend, but we are only concerned with the top
 * two levels of Tutorial and its contained Tasks, tracking Task completion status
 * on the backend. This API will be used to generate
 *
 * @package A8C\FSE
 */

/**
 * WPCom_Tutorials class
 */
class WPCom_Tutorials {

	/**
	 * The WP option for storing our task progress status.
	 */
	const OPTION_NAME = 'wpcom_tutorials_status';

	/**
	 * Storage for our singleton instance.
	 *
	 * @var null|WPCom_Tutorials
	 */
	private static $instance = null;

	/**
	 * Internal storage for registered Tutorials.
	 *
	 * @var array
	 */
	private $registry = array();

	/**
	 * Gets aour singleton instance, initiating it the first time.
	 *
	 * @return WPCom_Tutorials instance.
	 */
	public static function get_instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Registers a Tutorial.
	 *
	 * @param string $id      A unique ID for the Tutorial.
	 * @param array  $options `title` and `tasks` required.
	 *
	 * @return bool           True if successfully registered, false if it failed.
	 */
	public function register( $id, $options ) {
		// @todo verify tasks strutcture
		if ( ! $this->validate_options( $options ) ) {
			return false;
		}
		$options['id']         = $id;
		$this->registry[ $id ] = $options;
		return true;
	}

	/**
	 * Unregisters a registered Tutorial
	 *
	 * @param string $id Tutorial ID.
	 * @return bool      True if successfully unregistered, false if not found.
	 */
	public function unregister( $id ) {
		if ( ! isset( $this->registry[ $id ] ) ) {
			return false;
		}
		unset( $this->registry[ $id ] );
		return true;
	}

	/**
	 * Validates the options passed in `WPCom_Tutorials::register`.
	 *
	 * @param array $options Associative array passed with registration.
	 * @return bool          Validation success.
	 */
	private function validate_options( $options ) {
		if ( ! isset( $options['title'] ) || ! is_string( $options['title'] ) ) {
			return false;
		}
		if ( ! isset( $options['tasks'] ) || ! is_array( $options['tasks'] ) ) {
			return false;
		}
		foreach ( $options['tasks'] as $task ) {
			if ( ! $this->validate_task( $task ) ) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Validates a single task for expected structure.
	 *
	 * @param array $task A single task (id and title).
	 * @return bool       Validation success.
	 */
	private function validate_task( $task ) {
		return isset( $task['id'] ) && isset( $task['title'] );
	}

	/**
	 * Retrieves a Tutorial from the registry.
	 *
	 * @param string $id  The ID of the Tutorial to fetch.
	 * @return null|array Tutorial associative array if found, null if not.
	 */
	public function get( $id ) {
		if ( ! isset( $this->registry[ $id ] ) ) {
			return null;
		}
		$tutorial = $this->registry[ $id ];

		// Populating status at runtime so that any invalidations happen within the Options API.
		$tutorial['tasks'] = $this->get_tasks( $tutorial );
		return $tutorial;
	}

	/**
	 * Retrives all registered Tutorial IDs
	 *
	 * @return array list of registered Tutorial IDs.
	 */
	public function get_all() {
		return array_keys( $this->registry );
	}

	/**
	 * Gets registered tasks for a Tutorial, with stored completion status.
	 *
	 * @param array $tutorial Tutorial object.
	 * @return array          Tasks for Tutorial, with task completion status.
	 */
	private function get_tasks( $tutorial ) {
		$tasks_with_statuses = array();
		$statuses            = $this->get_statuses( $tutorial['id'] );

		foreach ( $tutorial['tasks'] as $task ) {
			$task['status']        = isset( $statuses[ $task['id'] ] ) ? $statuses[ $task['id'] ] : 'pending';
			$tasks_with_statuses[] = $task;
		}

		return $tasks_with_statuses;
	}

	/**
	 * Gets the completion statuses for a specific Tutorial.
	 *
	 * @param string $id Tutorial ID.
	 * @return array     Completion statuses for Tutorial ID.
	 */
	public function get_statuses( $id ) {
		$statuses = $this->load_all_statuses();
		return isset( $statuses[ $id ] ) ? $statuses[ $id ] : array();
	}

	/**
	 * Loads all Tutorial statuses.
	 *
	 * @return array All Tutorial completion statuses.
	 */
	private function load_all_statuses() {
		return (array) get_option( self::OPTION_NAME, array() );
	}

	/**
	 * Marks a task with a status.
	 *
	 * @param string $tutorial_id Tutorial ID.
	 * @param string $task_id     Task ID.
	 * @param string $status      Status for the task. Allowed: complete|skipped|pending.
	 * @return bool               True if status is updated, false otherwise.
	 */
	public function mark_task( $tutorial_id, $task_id, $status ) {
		if ( ! $this->validate_status( $status ) ) {
			return false;
		}

		$statuses = $this->load_all_statuses();
		if ( ! isset( $statuses[ $tutorial_id ] ) ) {
			$statuses[ $tutorial_id ] = array();
		}
		// pending is the natural state with no stored status.
		if ( 'pending' === $status ) {
			if ( isset( $statuses[ $tutorial_id ][ $task_id ] ) ) {
				unset( $statuses[ $tutorial_id ][ $task_id ] );
			}
		} else {
			$statuses[ $tutorial_id ][ $task_id ] = $status;
		}

		return update_option( self::OPTION_NAME, $statuses );
	}

	/**
	 * Checks if the status is valid.
	 *
	 * @param string $status A status to check. Allowed values: complete|pending|skipped.
	 * @return bool          If status if valid, true, otherwise false.
	 */
	private function validate_status( $status ) {
		$allowed = array( 'complete', 'pending', 'skipped' );
		return in_array( $status, $allowed, true );
	}
}
