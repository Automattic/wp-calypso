/**
 * Internal dependencies
 */
import {
	DOMAIN_NAMESERVERS_FETCH,
	DOMAIN_NAMESERVERS_FETCH_FAILURE,
	DOMAIN_NAMESERVERS_RECEIVE,
} from 'calypso/state/action-types';
import { keyedReducer } from 'calypso/state/utils';
import initialDomainState from './initial';

const reducer = keyedReducer( 'domainName', ( state = initialDomainState, action ) => {
	switch ( action.type ) {
		case DOMAIN_NAMESERVERS_FETCH: {
			return Object.assign( {}, state, {
				isFetching: true,
				error: false,
			} );
		}
		case DOMAIN_NAMESERVERS_FETCH_FAILURE: {
			return Object.assign( {}, state, {
				isFetching: false,
				error: true,
			} );
		}
		case DOMAIN_NAMESERVERS_RECEIVE: {
			return Object.assign( {}, state, {
				isFetching: false,
				hasLoadedFromServer: true,
				list: action.nameservers,
			} );
		}
	}

	return state;
} );

export default reducer;
