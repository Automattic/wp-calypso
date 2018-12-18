/** @format */

/**
 * External dependencies
 */

import {get, map, pickBy} from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

const initialState = [];
export function getSignupProgress( state ) {
	return get( state, 'signup.progress', initialState );
}

// TODO: memoize
// Here want to which the step the user last attempted
/**
 * Returns the last incomplete step in the signup flow
 *
 * @param  {Object}  state  Global state tree
 * @return {Object}        The step object
 */
export function getLatestIncompleteStep( state ) {
	//get latest in-progress, use progress date
}



