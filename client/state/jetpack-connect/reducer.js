/**
 * Internal dependencies
 */
import {
	JETPACK_CONNECT_CHECK_URL,
	JETPACK_CONNECT_CHECK_URL_RECEIVE
} from 'state/action-types';
import { combineReducers } from 'redux';

export function jetpackConnectSite( state = {}, action ) {
	switch ( action.type ) {
		case JETPACK_CONNECT_CHECK_URL:
			return Object.assign( {}, { url: action.url, isFetching: true, isFetched: false, data: {} } );
		case JETPACK_CONNECT_CHECK_URL_RECEIVE:
			if ( action.url === state.url ) {
				return Object.assign( {}, state, { isFetching: false, isFetched: true, data: action.data } );
			}
			return state;
	}
	return state;
}

export default combineReducers( {
	jetpackConnectSite
} );
