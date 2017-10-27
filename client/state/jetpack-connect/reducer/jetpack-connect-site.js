/** @format */
/**
 * Internal dependencies
 */
import {
	JETPACK_CONNECT_CHECK_URL,
	JETPACK_CONNECT_CHECK_URL_RECEIVE,
	JETPACK_CONNECT_DISMISS_URL_STATUS,
	JETPACK_CONNECT_CONFIRM_JETPACK_STATUS,
	JETPACK_CONNECT_COMPLETE_FLOW,
	JETPACK_CONNECT_REDIRECT,
} from 'state/action-types';

export default function jetpackConnectSite( state = {}, action ) {
	const defaultState = {
		url: null,
		isFetching: false,
		isFetched: false,
		isDismissed: false,
		installConfirmedByUser: null,
		data: {},
	};
	switch ( action.type ) {
		case JETPACK_CONNECT_CHECK_URL:
			return Object.assign( {}, defaultState, {
				url: action.url,
				isFetching: true,
				isFetched: false,
				isDismissed: false,
				installConfirmedByUser: null,
				data: {},
			} );
		case JETPACK_CONNECT_CHECK_URL_RECEIVE:
			if ( action.url === state.url ) {
				return Object.assign( {}, state, {
					isFetching: false,
					isFetched: true,
					data: action.data,
				} );
			}
			return state;
		case JETPACK_CONNECT_DISMISS_URL_STATUS:
			if ( action.url === state.url ) {
				return Object.assign( {}, state, { installConfirmedByUser: null, isDismissed: true } );
			}
			return state;
		case JETPACK_CONNECT_REDIRECT:
			if ( action.url === state.url ) {
				return Object.assign( {}, state, { isRedirecting: true } );
			}
			return state;
		case JETPACK_CONNECT_CONFIRM_JETPACK_STATUS:
			return Object.assign( {}, state, { installConfirmedByUser: action.status } );
		case JETPACK_CONNECT_COMPLETE_FLOW:
			return {};
	}
	return state;
}
