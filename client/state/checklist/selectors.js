/** @format */

/**
 * Returns true if site checklist notification is currently showing.
 *
 * @param {Object} state Global state tree
 * @return {bool} True if currently showing checklist notification
 */
export function getChecklistNotificationStatus( state ) {
	return state.checklist.showChecklistNotification;
}

/**
 * Returns next checklist task.
 *
 * @param {Object} state Global state tree
 * @return {bool} True if currently showing checklist notification
 */
export function getChecklistNextTask( state ) {
	return state.checklist.nextChecklistTask;
}
