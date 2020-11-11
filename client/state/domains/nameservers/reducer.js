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

/**
 * Updates name servers entry for given domain.
 *
 * @param {object} [state] Current state.
 * @param {object} [data] Domain name servers data.
 * @returns {object} New state
 */
function updateState( state, data ) {
	return Object.assign( {}, state, {
		...initialDomainState,
		...state,
		...data,
	} );
}

const reducer = keyedReducer( 'domainName', ( state = {}, action ) => {
	switch ( action.type ) {
		case DOMAIN_NAMESERVERS_FETCH: {
			return updateState( state, {
				isFetching: true,
				error: false,
			} );
		}
		case DOMAIN_NAMESERVERS_FETCH_FAILURE: {
			return updateState( state, {
				isFetching: false,
				error: true,
			} );
		}
		case DOMAIN_NAMESERVERS_RECEIVE: {
			return updateState( state, {
				isFetching: false,
				hasLoadedFromServer: true,
				list: action.nameservers,
			} );
		}
	}

	return state;
} );

export default reducer;
