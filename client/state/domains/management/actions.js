/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	DOMAIN_MANAGEMENT_WHOIS_RECEIVE,
	DOMAIN_MANAGEMENT_WHOIS_REQUEST,
	DOMAIN_MANAGEMENT_WHOIS_REQUEST_FAILURE,
	DOMAIN_MANAGEMENT_WHOIS_REQUEST_SUCCESS,
	DOMAIN_MANAGEMENT_WHOIS_SAVE,
	DOMAIN_MANAGEMENT_WHOIS_SAVE_FAILURE,
	DOMAIN_MANAGEMENT_WHOIS_SAVE_SUCCESS,
	DOMAIN_MANAGEMENT_WHOIS_UPDATE,
} from 'state/action-types';

/**
 * Returns an action object to be used in signalling that a domains contact details  object
 * has been received.
 *
 * @param	{String}   domain			domain queried
 * @param   {Object}   whois	contact details object
 * @returns {Object}   Action object
 */
export function receiveWhois( domain, whoisData ) {
	return {
		type: DOMAIN_MANAGEMENT_WHOIS_RECEIVE,
		domain,
		whoisData
	};
}

/**
 * Triggers a network request to query domain contact details
 * @param   {String}   domain	domain to query
 * @returns {Function}          Action thunk
 */
export function requestWhois( domain ) {
	return ( dispatch ) => {
		dispatch( {
			type: DOMAIN_MANAGEMENT_WHOIS_REQUEST,
			domain
		} );

		return wpcom.undocumented().fetchWhois( domain )
			.then( whoisData => {
				dispatch( receiveWhois( domain, whoisData ) );
				dispatch( {
					type: DOMAIN_MANAGEMENT_WHOIS_REQUEST_SUCCESS,
					domain
				} );
			} )
			.catch( error => {
				dispatch( {
					type: DOMAIN_MANAGEMENT_WHOIS_REQUEST_FAILURE,
					domain,
					error
				} );
			} );
	};
}

export function saveWhois( domain, whoisData ) {
	return ( dispatch ) => {
		dispatch( {
			type: DOMAIN_MANAGEMENT_WHOIS_SAVE,
			domain
		} );

		return wpcom.undocumented().updateWhois( domain, whoisData )
			.then( ( { updated } ) => {
				dispatch( updateWhois( domain, updated ) );
				dispatch( {
					type: DOMAIN_MANAGEMENT_WHOIS_SAVE_SUCCESS,
					domain
				} );
			} )
			.catch( error => {
				dispatch( {
					type: DOMAIN_MANAGEMENT_WHOIS_SAVE_FAILURE,
					domain,
					error
				} );
			} );
	};
}

export function updateWhois( domain, whoisData ) {
	return {
		type: DOMAIN_MANAGEMENT_WHOIS_UPDATE,
		domain,
		whoisData
	};
}

