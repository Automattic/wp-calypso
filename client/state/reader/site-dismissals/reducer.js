/** @format */

/**
 * Internal dependencies
 */
import { READER_DISMISS_SITE, READER_DISMISS_POST } from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';

export const items = createReducer(
	{},
	{
		[ READER_DISMISS_SITE ]: ( state, action ) => {
			return {
				...state,
				[ action.payload.siteId ]: true,
			};
		},
		[ READER_DISMISS_POST ]: ( state, action ) => {
			return {
				...state,
				[ action.payload.siteId ]: true,
			};
		},
	}
);

export default combineReducers( {
	items,
} );
