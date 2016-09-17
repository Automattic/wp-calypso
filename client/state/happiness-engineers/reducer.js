/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { itemsSchema } from './schema';
import {
	HAPPINESS_ENGINEERS_FETCH,
	HAPPINESS_ENGINEERS_RECEIVE,
	HAPPINESS_ENGINEERS_FETCH_FAILURE,
	HAPPINESS_ENGINEERS_FETCH_SUCCESS
} from 'state/action-types';

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks whether a network request is in progress for a site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @return {Object}        Updated state
 */
export const requesting = createReducer( false, {
	[ HAPPINESS_ENGINEERS_FETCH ]: () => {
		return true;
	},
	[ HAPPINESS_ENGINEERS_FETCH_FAILURE ]: () => {
		return false;
	},
	[ HAPPINESS_ENGINEERS_FETCH_SUCCESS ]: () => {
		return false;
	}
} );

/**
 * Returns the updated items state after an action has been dispatched. Items
 * state tracks an array of happiness engineers. Receiving happiness engineers
 * for a site will replace the existing set.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @return {Object}        Updated state
 */
export const items = createReducer( {}, {
	[ HAPPINESS_ENGINEERS_RECEIVE ]: ( state, { happinessEngineers } ) => {
		return { ...keyBy( happinessEngineers, 'avatar_URL' ) };
	}
}, itemsSchema );

export default combineReducers( {
	requesting,
	items
} );
