/** @format */

/**
 * External dependencies
 */
import { isArray } from 'lodash';
import update from 'immutability-helper';

/**
 * Internal dependencies
 */
import {
	WHOIS_FETCH,
	WHOIS_FETCH_COMPLETED,
	WHOIS_FETCH_FAILED,
	WHOIS_UPDATE_COMPLETED,
} from 'lib/upgrades/action-types';
import { whoisType } from './constants';

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

/**
 * @desc Updates registrant contact details in state[ {domainName} ].data
 *
 * @param {Object} [domainState] Current state for {domainName}.
 * @param {Object} [registrantContactDetails] New registrant contact details
 * @return {Array} New data state.
 */
function mergeDomainRegistrantContactDetails( domainState, registrantContactDetails ) {
	return isArray( domainState.data )
		? domainState.data.map( item => {
				if ( item.type === whoisType.REGISTRANT ) {
					return {
						...item,
						...registrantContactDetails,
					};
				}
				return item;
		  } )
		: [
				{
					...registrantContactDetails,
					type: whoisType.REGISTRANT,
				},
		  ];
}

function reducer( state, payload ) {
	const { action } = payload;

	switch ( action.type ) {
		case WHOIS_FETCH:
			state = updateDomainState( state, action.domainName, {
				isFetching: true,
				needsUpdate: false,
			} );
			break;
		case WHOIS_FETCH_FAILED:
			state = updateDomainState( state, action.domainName, {
				isFetching: false,
				needsUpdate: true,
			} );
			break;
		case WHOIS_FETCH_COMPLETED:
			state = updateDomainState( state, action.domainName, {
				data: action.data,
				hasLoadedFromServer: true,
				isFetching: false,
				needsUpdate: false,
			} );
			break;
		case WHOIS_UPDATE_COMPLETED:
			state = updateDomainState( state, action.domainName, {
				needsUpdate: true,
				// merge validated contact details from the form into whois data
				data: mergeDomainRegistrantContactDetails(
					state[ action.domainName ],
					action.registrantContactDetails
				),
			} );
			break;
	}

	return state;
}

export { initialDomainState, reducer };
