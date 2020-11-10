/**
 * Internal dependencies
 */
import {
	DOMAIN_NAMESERVERS_FETCH,
	DOMAIN_NAMESERVERS_FETCH_FAILURE,
	DOMAIN_NAMESERVERS_FETCH_SUCCESS,
	DOMAIN_NAMESERVERS_UPDATE_SUCCESS,
} from 'calypso/state/action-types';

export const initialDomainState = {
	isFetching: false,
	hasLoadedFromServer: false,
	error: false,
	list: null,
};

/**
 * Updates name servers entry for given domain.
 *
 * @param {object} [state] Current state.
 * @param {string} [domainName] Domain name.
 * @param {object} [data] Domain name servers data.
 * @returns {object} New state
 */
function updateState( state, domainName, data ) {
	return Object.assign( {}, state, {
		[ domainName ]: {
			...initialDomainState,
			...state[ domainName ],
			...data,
		},
	} );
}

export default function reducer( state = {}, action ) {
	switch ( action.type ) {
		case DOMAIN_NAMESERVERS_FETCH: {
			return updateState( state, action.domainName, {
				isFetching: true,
				error: false,
			} );
		}
		case DOMAIN_NAMESERVERS_FETCH_FAILURE: {
			return updateState( state, action.domainName, {
				isFetching: false,
				error: true,
			} );
		}
		case DOMAIN_NAMESERVERS_FETCH_SUCCESS: {
			return updateState( state, action.domainName, {
				isFetching: false,
				hasLoadedFromServer: true,
				list: action.nameservers,
			} );
		}
		case DOMAIN_NAMESERVERS_UPDATE_SUCCESS: {
			return updateState( state, action.domainName, {
				isFetching: false,
				hasLoadedFromServer: true,
				list: action.nameservers,
			} );
		}
	}

	return state;
}
