/**
 * Internal dependencies
 */

import { combineReducers } from 'calypso/state/utils';
import {
	SITE_CONNECTION_STATUS_RECEIVE,
	SITE_CONNECTION_STATUS_REQUEST,
	SITE_CONNECTION_STATUS_REQUEST_FAILURE,
	SITE_CONNECTION_STATUS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';

const createRequestingReducer = ( requesting ) => ( state, { siteId } ) => ( {
	...state,
	[ siteId ]: requesting,
} );

export const items = ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_CONNECTION_STATUS_RECEIVE: {
			const { siteId, status } = action;

			return {
				...state,
				[ siteId ]: status,
			};
		}
	}

	return state;
};

export const requesting = ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_CONNECTION_STATUS_REQUEST:
			return createRequestingReducer( true )( state, action );
		case SITE_CONNECTION_STATUS_REQUEST_FAILURE:
			return createRequestingReducer( false )( state, action );
		case SITE_CONNECTION_STATUS_REQUEST_SUCCESS:
			return createRequestingReducer( false )( state, action );
	}

	return state;
};

export default combineReducers( {
	items,
	requesting,
} );
