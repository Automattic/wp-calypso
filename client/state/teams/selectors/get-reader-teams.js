/**
 * Internal dependencies
 */
import 'calypso/state/teams/init';

/**
 * Returns all of the reader teams for a user
 *
 *
 * @param {object}  state  Global state tree
 * @returns {Array}          Reader Teams
 */

export default function getReaderTeams( state ) {
	return state.teams.items;
}
