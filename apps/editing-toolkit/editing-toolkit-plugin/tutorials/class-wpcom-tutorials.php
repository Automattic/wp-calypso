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
	 * Gets our singleton instance, initiating it the first time.
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
		return isset( $task['id'] )
			&& is_string( $task['id'] )
			&& isset( $task['title'] )
			&& is_string( $task['title'] );
	}

	/**
	 * Retrieves a Tutorial from the registry.
	 *
	 * @param string $id  The ID of the Tutorial to fetch.
	 * @return null|array Tutorial associative array if found, null if not.
	 */
	public function get_tutorial( $id ) {
		if ( ! isset( $this->registry[ $id ] ) ) {
			return null;
		}
		$tutorial = $this->registry[ $id ];

		// Populating status at runtime so that any cache invalidations happen within the User meta/attributes API.
		$tutorial['tasks'] = $this->get_tasks( $tutorial );
		return $tutorial;
	}

	/**
	 * Retrives all registered Tutorial IDs
	 *
	 * @return array list of registered Tutorial IDs.
	 */
	public function get_registered_ids() {
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
			// Default status is pending.
			$task['status'] = 'pending';
			if ( isset( $statuses[ $task['id'] ] ) ) {
				$task['status'] = $statuses[ $task['id'] ];
			}
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
		$statuses = $this->load_persisted_statuses();
		return isset( $statuses[ $id ] ) ? $statuses[ $id ] : array();
	}

	/**
	 * Loads all Tutorial statuses from the database.
	 *
	 * @return array All Tutorial completion statuses.
	 */
	private function load_persisted_statuses() {
		if ( function_exists( 'get_user_attribute' ) ) {
			return get_user_attribute( get_current_user_id(), 'wpcom_tutorials_status' );
		}
		return (array) get_user_meta( get_current_user_id(), 'wpcom_tutorials_status', true );
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
		if ( ! $this->task_exists( $tutorial_id, $task_id ) ) {
			return false;
		}

		$statuses = $this->load_persisted_statuses();
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

		return $this->persist_statuses( $statuses );
	}

	/**
	 * Checks if a task exists for a registered tutorial.
	 *
	 * @param string $tutorial_id A tutorial ID.
	 * @param string $task_id     A task ID.
	 * @return bool True if it exists, otherwise false.
	 */
	private function task_exists( $tutorial_id, $task_id ) {
		$tutorial = $this->get_tutorial( $tutorial_id );
		foreach ( $tutorial['tasks'] as $task ) {
			if ( $task_id === $task['id'] ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Persist statuses to the DB, using the platform-appropriate tech
	 *
	 * @param array $statuses All statuses to persist.
	 * @return bool           True if persisting succeeded, otherwise false.
	 */
	public function persist_statuses( $statuses ) {
		if ( function_exists( 'update_user_attribute' ) ) {
			return update_user_attribute( get_current_user_id(), 'wpcom_tutorials_status', $statuses );
		}
		return update_user_meta( get_current_user_id(), 'wpcom_tutorials_status', $statuses );
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
