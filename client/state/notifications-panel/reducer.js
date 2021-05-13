/**
 * Internal dependencies
 */
import { NOTIFICATIONS_FORCE_REFRESH } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
/**
 *
 * @param {object} state Current state
 * @param {object} action Action payload
 * @returns {object} Updated state
 */
export const shouldForceRefresh = ( state = false, { type, refresh } ) => {
	if ( type === NOTIFICATIONS_FORCE_REFRESH ) {
		return refresh || false;
	}
	return state;
};

const reducer = combineReducers( {
	shouldForceRefresh,
} );

export default reducer;
