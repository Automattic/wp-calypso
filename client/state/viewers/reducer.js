/**
 * External dependencies
 */
import { keyBy, union } from 'lodash';

/**
 * Internal dependencies
 */
import {
	VIEWERS_REQUEST,
	VIEWERS_REQUEST_FAILURE,
	VIEWERS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

export const items = ( state = {}, action ) => {
	switch ( action.type ) {
		case VIEWERS_REQUEST_SUCCESS: {
			return Object.assign(
				{},
				state,
				keyBy( action.data?.viewers, ( viewer ) => viewer.ID )
			);
		}
	}

	return state;
};

export const queries = ( state = {}, action ) => {
	switch ( action.type ) {
		case VIEWERS_REQUEST_SUCCESS: {
			const { siteId, data } = action;
			const ids = data?.viewers.map( ( viewer ) => viewer.ID );
			return {
				...state,
				[ siteId ]: {
					ids: union( state[ siteId ]?.ids, ids ),
					found: action.data.found,
				},
			};
		}
	}

	return state;
};

export const fetching = ( state = false, action ) => {
	switch ( action.type ) {
		case VIEWERS_REQUEST:
		case VIEWERS_REQUEST_SUCCESS:
		case VIEWERS_REQUEST_FAILURE: {
			return Object.assign( {}, state, {
				[ action.siteId ]: VIEWERS_REQUEST === action.type,
			} );
		}
	}
	return state;
};

export default combineReducers( { items, queries, fetching } );
