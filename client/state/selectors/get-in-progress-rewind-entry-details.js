/**
 * Internal dependencies
 */
import getRewindState from './get-rewind-state';

/**
 * @typedef {Object} EntryDetails
 * @property {string} message - The description of current action taking place
 * @property {string} entry - The value (filename/tablename) being processed
 */

/**
 * Returns object containing rewind status current entry and message
 *
 * @param {object} state Global state tree
 * @param {?number|string} siteId the site ID
 * @param {string} rewindId the id of the rewind to get the rewind status entry and message
 * @returns {EntryDetails} Details of the current rewind action
 */
export default function getInProgressRewindEntryDetails( state, siteId, rewindId ) {
	const maybeRewindState = getRewindState( state, siteId );
	return maybeRewindState.state === 'active' &&
		maybeRewindState.rewind &&
		maybeRewindState.rewind.rewindId === rewindId &&
		maybeRewindState.rewind.hasOwnProperty( 'message' ) &&
		maybeRewindState.rewind.hasOwnProperty( 'currentEntry' )
		? { message: maybeRewindState.rewind.message, entry: maybeRewindState.rewind.currentEntry }
		: {};
}
