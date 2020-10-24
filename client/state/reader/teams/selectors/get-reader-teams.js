/**
 * Internal dependencies
 */
import 'calypso/state/reader/init';

/**
 * Returns all of the reader teams for a user
 *
 *
 * @param {object}  state  Global state tree
 * @returns {Array}          Reader Teams
 */

export default function getReaderTeams( state ) {
	return state.reader.teams.items;
}
