/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import { MEDIA_RECEIVE } from 'state/action-types';
import { createReducer } from 'state/utils';

export const items = createReducer( {}, {
	[ MEDIA_RECEIVE ]: ( state, action ) => {
		const { siteId, media } = action;

		return {
			...state,
			[ siteId ]: {
				...state[ siteId ],
				...keyBy( media, 'ID' )
			}
		};
	}
} );

export default combineReducers( {
	items
} );
