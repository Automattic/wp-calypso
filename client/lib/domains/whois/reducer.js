/** @format */

/**
 * External dependencies
 */

import update from 'immutability-helper';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from 'lib/upgrades/constants';
import { findRegistrantWhois } from 'lib/domains/whois/utils';

const initialDomainState = {
	data: null,
	hasLoadedFromServer: false,
	isFetching: false,
	needsUpdate: true,
};

/**
 * @desc Updates WHOIS entry for given domain.
 *
 * @param {Object} [state] Current state.
 * @param {string} [domainName] Domain name.
 * @param {Object} [data] Domain WHOIS data.
 * @return {Object} New state.
 */
function updateDomainState( state, domainName, data ) {
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
		case ActionTypes.WHOIS_FETCH:
			state = updateDomainState( state, action.domainName, {
				isFetching: true,
				needsUpdate: false,
			} );
			break;
		case ActionTypes.WHOIS_FETCH_FAILED:
			state = updateDomainState( state, action.domainName, {
				isFetching: false,
				needsUpdate: true,
			} );
			break;
		case ActionTypes.WHOIS_FETCH_COMPLETED:
			state = updateDomainState( state, action.domainName, {
				data: action.data,
				registrantContactDetails: findRegistrantWhois( action.data ),
				hasLoadedFromServer: true,
				isFetching: false,
				needsUpdate: false,
			} );
			break;
		case ActionTypes.WHOIS_UPDATE_COMPLETED:
			state = updateDomainState( state, action.domainName, {
				needsUpdate: true,
				registrantContactDetails: {
					...state.registrantContactDetails,
					...action.registrantContactDetails,
				},
			} );
			break;
	}

	return state;
}

export { initialDomainState, reducer };
