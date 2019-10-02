/** @format */

/**
 * Internal dependencies
 */
import { MEMBERSHIPS_EARNINGS_RECEIVE } from 'state/action-types';
import { combineReducers, withoutPersistence } from 'state/utils';

const summary = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case MEMBERSHIPS_EARNINGS_RECEIVE:
			return ( ( state, data ) => ( {
				...state,
				[ data.siteId ]: data.earnings,
			} ) )( state, action );
	}

	return state;
} );

export default combineReducers( {
	summary,
} );
