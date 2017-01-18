/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns all of the reader teams for a user
 *
 * @param  {Object}  state  Global state tree
 * @return {Array}          Reader Teams
 */
export default function getReaderTeams( state ) {
	return get( state, [ 'reader', 'teams', 'items' ] );
}
