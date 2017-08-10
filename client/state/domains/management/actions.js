/** @format */
/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_RECEIVE,
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_REQUEST,
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_REQUEST_FAILURE,
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_REQUEST_SUCCESS,
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_UPDATE,
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
 * Returns an action object to be used in signalling that a cached domains
 * contact details object has been received.
 *
 * @param   {Object}   data   cached contact details object
 * @returns {Object}   Action object
 */
export function receiveContactDetailsCache( data ) {
	return {
		type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_RECEIVE,
		data,
	};
}

/**
 * Triggers a network request to query domain contact details
 * cached data (originated from last domain purchase)
 * @returns {Function}          Action thunk
 */
export function requestContactDetailsCache() {
	return dispatch => {
		dispatch( {
			type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_REQUEST,
		} );

		wpcom.undocumented().getDomainContactInformation( ( error, data ) => {
			if ( error ) {
				dispatch( {
					type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_REQUEST_FAILURE,
					error,
				} );
				return;
			}

			dispatch( receiveContactDetailsCache( data ) );
			dispatch( {
				type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_REQUEST_SUCCESS,
			} );
		} );
	};
}

export function updateContactDetailsCache( data ) {
	return {
		type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_UPDATE,
		data,
	};
}

/**
 * Returns an action object to be used in signalling that a WHOIS details
 * object has been received.
 *
 * @param	{String}   domain		domain queried
 * @param   {Object}   whoisData	contact details object
 * @returns {Object}   Action object
 */
export function receiveWhois( domain, whoisData ) {
	return {
		type: DOMAIN_MANAGEMENT_WHOIS_RECEIVE,
		domain,
		whoisData,
	};
}

/**
 * Triggers a network request to query WHOIS details
 *
 * @param   {String}   domain	domain to query
 * @returns {Function}          Action thunk
 */
export function requestWhois( domain ) {
	return dispatch => {
		dispatch( {
			type: DOMAIN_MANAGEMENT_WHOIS_REQUEST,
			domain,
		} );

		return wpcom
			.undocumented()
			.fetchWhois( domain )
			.then( whoisData => {
				dispatch( receiveWhois( domain, whoisData ) );
				dispatch( {
					type: DOMAIN_MANAGEMENT_WHOIS_REQUEST_SUCCESS,
					domain,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: DOMAIN_MANAGEMENT_WHOIS_REQUEST_FAILURE,
					domain,
					error,
				} );
			} );
	};
}

/**
 * Sends a network request to the server to save updated WHOIS details
 * at the domain's registrar.
 *
 * @param   {String}   domain		domain to query
 * @param   {Object}   whoisData	whois details object
 * @returns {Function}				Action thunk
 */
export function saveWhois( domain, whoisData ) {
	return dispatch => {
		dispatch( {
			type: DOMAIN_MANAGEMENT_WHOIS_SAVE,
			domain,
		} );

		return wpcom
			.undocumented()
			.updateWhois( domain, whoisData )
			.then( ( { updated } ) => {
				dispatch( updateWhois( domain, updated ) );
				dispatch( {
					type: DOMAIN_MANAGEMENT_WHOIS_SAVE_SUCCESS,
					domain,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: DOMAIN_MANAGEMENT_WHOIS_SAVE_FAILURE,
					domain,
					error,
				} );
			} );
	};
}

export function updateWhois( domain, whoisData ) {
	return {
		type: DOMAIN_MANAGEMENT_WHOIS_UPDATE,
		domain,
		whoisData,
	};
}
