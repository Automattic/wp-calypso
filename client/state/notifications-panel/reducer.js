import { NOTIFICATIONS_FORCE_REFRESH } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

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
