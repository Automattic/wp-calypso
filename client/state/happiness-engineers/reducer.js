/**
 * External dependencies
 */
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import {
	combineReducers,
	withoutPersistence,
	withSchemaValidation,
	withStorageKey,
} from 'calypso/state/utils';
import { itemsSchema } from './schema';
import {
	HAPPINESS_ENGINEERS_FETCH,
	HAPPINESS_ENGINEERS_RECEIVE,
	HAPPINESS_ENGINEERS_FETCH_FAILURE,
	HAPPINESS_ENGINEERS_FETCH_SUCCESS,
} from 'calypso/state/action-types';

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks whether a network request is in progress for a site.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action object
 * @returns {object}        Updated state
 */
export const requesting = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case HAPPINESS_ENGINEERS_FETCH:
			return true;
		case HAPPINESS_ENGINEERS_FETCH_FAILURE:
			return false;
		case HAPPINESS_ENGINEERS_FETCH_SUCCESS:
			return false;
	}

	return state;
} );

/**
 * Returns the updated items state after an action has been dispatched. Items
 * state tracks an array of happiness engineers. Receiving happiness engineers
 * for a site will replace the existing set.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action object
 * @returns {Array}         Updated state
 */
export const items = withSchemaValidation( itemsSchema, ( state = null, action ) => {
	switch ( action.type ) {
		case HAPPINESS_ENGINEERS_RECEIVE: {
			const { happinessEngineers } = action;
			return map( happinessEngineers, 'avatar_URL' );
		}
	}

	return state;
} );

const combinedReducer = combineReducers( {
	requesting,
	items,
} );

export default withStorageKey( 'happinessEngineers', combinedReducer );
