/**
 * External dependencies
 */
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import { getCurrentUser } from 'state/current-user/selectors';

const debug = debugModule('calypso:reader:start'); //eslint-disable-line no-unused-vars

/**
 * Has the user graduated from the Reader follow recommendations process?
 *
 * @param  {Object}  state  Global state tree
 * @return {Boolean} Has user graduated from initial follow recommendations?
 */
export function hasGraduatedRecommendations(state) {
    let graduated = state.reader.start.hasGraduated;
    if (graduated === null) {
        const user = getCurrentUser(state);
        graduated = !user.is_new_reader;
    }
    return graduated;
}

/**
 * Returns true if the reader is currently requesting graduation
 * @param  {object}  state Global state tree
 * @return {Boolean}       Is the user requesting graduation?
 */
export function isRequestingGraduation(state) {
    return state.reader.start.isRequestingGraduation;
}
