/**
 * Internal dependencies
 */
import { ACCOUNT_CLOSE_SUCCESS } from 'state/action-types';
import { combineReducers, withoutPersistence } from 'state/utils';

export const isClosed = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case ACCOUNT_CLOSE_SUCCESS: {
			return true;
		}
	}

	return state;
} );

export default combineReducers( { isClosed } );
