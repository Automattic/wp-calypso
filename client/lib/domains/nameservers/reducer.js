/**
 * External dependencies
 */

import update from 'immutability-helper';

/**
 * Internal dependencies
 */
import {
	NAMESERVERS_FETCH,
	NAMESERVERS_FETCH_COMPLETED,
	NAMESERVERS_FETCH_FAILED,
	NAMESERVERS_UPDATE_COMPLETED,
} from './action-types';

const initialDomainState = {
	isFetching: false,
	hasLoadedFromServer: false,
	error: false,
	list: null,
};

/**
 * @description Updates name servers entry for given domain.
 *
 * @param {object} [state] Current state.
 * @param {string} [domainName] Domain name.
 * @param {object} [data] Domain name servers data.
 * @returns {object} New state
 */
function updateState( state, domainName, data ) {
	const command = {
		[ domainName ]: {
			$set: Object.assign( {}, state[ domainName ] || initialDomainState, data ),
		},
	};

	return update( state, command );
}

function reducer( state, payload ) {
	const { action } = payload;

	switch ( action.type ) {
		case NAMESERVERS_FETCH:
			state = updateState( state, action.domainName, {
				isFetching: true,
				error: false,
			} );
			break;
		case NAMESERVERS_FETCH_FAILED:
			state = updateState( state, action.domainName, {
				isFetching: false,
				error: true,
			} );
			break;
		case NAMESERVERS_FETCH_COMPLETED:
			state = updateState( state, action.domainName, {
				isFetching: false,
				hasLoadedFromServer: true,
				list: action.nameservers,
			} );
			break;
		case NAMESERVERS_UPDATE_COMPLETED:
			state = updateState( state, action.domainName, {
				isFetching: false,
				hasLoadedFromServer: true,
				list: action.nameservers,
			} );
			break;
	}

	return state;
}

export { initialDomainState, reducer };
