/**
 * External dependencies
 */
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import getRewindState from './get-rewind-state';

/**
 * @typedef {Object} EntryDetails
 * @property {string} message - The description of current action taking place
 * @property {string} currentEntry - The value (filename/tablename) being processed
 */

/**
 * Returns object containing rewind status current entry and message
 *
 * @param {object} globalState Global state tree
 * @param {?number|string} siteId the site ID
 * @param {string} rewindId the id of the rewind to get the rewind status entry and message
 * @returns {EntryDetails} Details of the current rewind action
 */
export default function getInProgressRewindEntryDetails( globalState, siteId, rewindId ) {
	const { state, rewind } = getRewindState( globalState, siteId );

	if ( 'active' === state && rewind?.rewindId === rewindId ) {
		return pick( rewind, [ 'message', 'currentEntry' ] );
	}

	return {};
}
