/**
 * Internal dependencies
 */
import { combineReducers, withoutPersistence, withStorageKey } from 'state/utils';
import {
	STORE_SETUP_FETCH,
	STORE_SETUP_FETCH_FAILURE,
	STORE_SETUP_FETCH_SUCCESS,
} from 'state/action-types';

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks whether a network request is in progress for a site.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action object
 * @returns {object}       Updated state
 */
export const requesting = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case STORE_SETUP_FETCH:
			return true;
		case STORE_SETUP_FETCH_FAILURE:
			return false;
		case STORE_SETUP_FETCH_SUCCESS:
			return false;
	}

	return state;
} );

/**
 * Returns the updated items state after an action has been dispatched. Items
 * state tracks an object with the store setup data. Receiving the store setup data
 * for a site will replace the existing set.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action object
 * @returns {Array}        Updated state
 */
export const data = withoutPersistence(
	(
		state = {
			isHidden: false,
			remainingTasks: 0,
			timing: 0,
			totalTasks: 0,
			errors: {},
		},
		{ data, error, type }
	) => {
		switch ( type ) {
			case STORE_SETUP_FETCH_FAILURE:
				return {
					...state,
					error,
				};
			case STORE_SETUP_FETCH_SUCCESS:
				const { isHidden, remainingTasks, timing, totalTasks } = data;
				return {
					...state,
					isHidden,
					remainingTasks,
					timing,
					totalTasks,
				};
		}

		return state;
	}
);

const combinedReducer = combineReducers( {
	requesting,
	data,
} );

export default withStorageKey( 'storeSetup', combinedReducer );
