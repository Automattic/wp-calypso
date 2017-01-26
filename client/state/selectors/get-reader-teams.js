/**
 * Returns all of the reader teams for a user
 *
 * @param  {Object}  state  Global state tree
 * @return {Array}          Reader Teams
 */
export default function getReaderTeams( state ) {
	return state.reader.teams.items;
}
