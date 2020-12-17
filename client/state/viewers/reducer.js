/**
 * External dependencies
 */
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import {
	VIEWER_REMOVE_SUCCESS,
	VIEWERS_REQUEST,
	VIEWERS_REQUEST_FAILURE,
	VIEWERS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers, keyedReducer, withStorageKey } from 'calypso/state/utils';

export const items = ( state = {}, action ) => {
	switch ( action.type ) {
		case VIEWERS_REQUEST_SUCCESS: {
			return Object.assign(
				{},
				state,
				action.data?.viewers.reduce( ( acc, viewer ) => {
					acc[ viewer.ID ] = viewer;
					return acc;
				}, {} )
			);
		}
		case VIEWER_REMOVE_SUCCESS: {
			return Object.assign( {}, omit( state, action.viewerId ) );
		}
	}
	return state;
};

export const queries = keyedReducer( 'siteId', ( state = {}, action ) => {
	switch ( action.type ) {
		case VIEWERS_REQUEST_SUCCESS: {
			const { data } = action;
			const existingIds = state?.ids ?? [];
			const ids = data?.viewers.map( ( viewer ) => viewer.ID );

			return {
				ids: [ ...new Set( existingIds.concat( ids ) ) ],
				found: action.data.found,
			};
		}
		case VIEWER_REMOVE_SUCCESS: {
			const { viewerId } = action;
			return {
				ids: state.ids.filter( ( id ) => id !== viewerId ),
				found: state.found - 1,
			};
		}
	}
	return state;
} );

export const fetching = keyedReducer( 'siteId', ( state = false, action ) => {
	switch ( action.type ) {
		case VIEWERS_REQUEST:
		case VIEWERS_REQUEST_SUCCESS:
		case VIEWERS_REQUEST_FAILURE: {
			return VIEWERS_REQUEST === action.type;
		}
	}
	return state;
} );

export default withStorageKey( 'viewers', combineReducers( { items, queries, fetching } ) );
