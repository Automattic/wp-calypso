/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { keyBy, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { MEDIA_DELETE, MEDIA_RECEIVE } from 'state/action-types';
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
	},
	[ MEDIA_DELETE ]: ( state, action ) => {
		const { siteId, mediaIds } = action;

		if ( ! state[ siteId ] ) {
			return state;
		}

		return {
			...state,
			[ siteId ]: omit( state[ siteId ], mediaIds )
		};
	}
} );

export default combineReducers( {
	items
} );
