/**
 * Internal dependencies
 */

import { combineReducers, withoutPersistence } from 'calypso/state/utils';
import { MAILCHIMP_LISTS_RECEIVE } from 'calypso/state/action-types';

export const items = withoutPersistence( ( state = [], action ) => {
	switch ( action.type ) {
		case MAILCHIMP_LISTS_RECEIVE: {
			const { siteId, lists } = action;

			return {
				...state,
				[ siteId ]: lists,
			};
		}
	}

	return state;
} );

export default combineReducers( {
	items,
} );
