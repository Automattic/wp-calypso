/**
 * Internal dependencies
 */
import { NOTIFICATIONS_FORCE_REFRESH } from 'state/action-types';
import { combineReducers } from 'state/utils';
/**
 *
 * @param {object} state Current state
 * @param {object} action Action payload
 * @returns {object} Updated state
 */
export const shouldForceNotificationsRefresh = ( state = false, { type, refresh } ) => {
	if ( type === NOTIFICATIONS_FORCE_REFRESH ) {
		return refresh || false;
	}
	return state;
};

const reducer = combineReducers( {
	shouldForceNotificationsRefresh,
} );

export default reducer;
