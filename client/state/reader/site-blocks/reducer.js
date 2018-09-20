/** @format */
/**
 * External dependencies
 */
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_SITE_BLOCK,
	READER_SITE_UNBLOCK,
	READER_SITE_REQUEST_SUCCESS,
} from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';

export const items = createReducer(
	{},
	{
		[ READER_SITE_BLOCK ]: ( state, action ) => {
			return {
				...state,
				[ action.payload.siteId ]: true,
			};
		},
		[ READER_SITE_UNBLOCK ]: ( state, action ) => {
			return omit( state, action.payload.siteId );
		},
		[ READER_SITE_REQUEST_SUCCESS ]: ( state, action ) => {
			if ( ! action.payload.is_blocked ) {
				if ( ! state[ action.payload.ID ] ) {
					return state;
				}

				return omit( state, action.payload.ID );
			}

			return {
				...state,
				[ action.payload.ID ]: true,
			};
		},
	}
);

export default combineReducers( {
	items,
} );
