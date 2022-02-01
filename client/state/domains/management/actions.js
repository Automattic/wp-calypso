import { mapRecordKeysRecursively, snakeToCamelCase } from '@automattic/js-utils';
import { translate } from 'i18n-calypso';
import wpcom from 'calypso/lib/wp';
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
} from 'calypso/state/action-types';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

import 'calypso/state/domains/init';

/**
 * Returns an action object to be used in signalling that a cached domains
 * contact details object has been received.
 *
 * @param   {object}   data   cached contact details object
 * @returns {object}   Action object
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
 *
 * @returns {Function}          Action thunk
 */
export function requestContactDetailsCache() {
	return ( dispatch ) => {
		dispatch( {
			type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_REQUEST,
		} );

		wpcom.req
			.get( '/me/domain-contact-information' )
			.then( ( data ) => {
				dispatch(
					receiveContactDetailsCache( mapRecordKeysRecursively( data, snakeToCamelCase ) )
				);
				dispatch( {
					type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_REQUEST_SUCCESS,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_REQUEST_FAILURE,
					error,
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
 * @param	{string}   domain		domain queried
 * @param   {object}   whoisData	contact details object
 * @returns {object}   Action object
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
 * @param   {string}   domain	domain to query
 * @returns {Function}          Action thunk
 */
export function requestWhois( domain ) {
	return ( dispatch ) => {
		dispatch( {
			type: DOMAIN_MANAGEMENT_WHOIS_REQUEST,
			domain,
		} );

		return wpcom.req
			.get( `/domains/${ domain }/whois` )
			.then( ( whoisData ) => {
				dispatch( receiveWhois( domain, whoisData ) );
				dispatch( {
					type: DOMAIN_MANAGEMENT_WHOIS_REQUEST_SUCCESS,
					domain,
				} );
			} )
			.catch( ( error ) => {
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
 * @param   {string}   domain		domain to query
 * @param   {object}   whoisData	whois details object
 * @param	  {boolean}  transferLock set 60-day transfer lock after update
 * @returns {Function}				Action thunk
 */
export function saveWhois( domain, whoisData, transferLock ) {
	return ( dispatch ) => {
		dispatch( {
			type: DOMAIN_MANAGEMENT_WHOIS_SAVE,
			domain,
		} );

		return wpcom.req
			.post( `/domains/${ domain }/whois`, {
				whois: whoisData,
				transfer_lock: transferLock,
			} )
			.then( ( data ) => {
				dispatch( updateWhois( domain, whoisData ) );
				dispatch( {
					type: DOMAIN_MANAGEMENT_WHOIS_SAVE_SUCCESS,
					domain,
					data,
				} );
			} )
			.catch( ( error ) => {
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

export const showUpdatePrimaryDomainSuccessNotice = ( domainName ) => {
	return ( dispatch ) => {
		dispatch(
			successNotice(
				translate(
					'Primary domain changed: all domains will redirect to {{em}}%(domainName)s{{/em}}.',
					{ args: { domainName }, components: { em: <em /> } }
				),
				{ duration: 10000, isPersistent: true }
			)
		);
	};
};

export const showUpdatePrimaryDomainErrorNotice = ( errorMessage ) => {
	return ( dispatch ) => {
		dispatch(
			errorNotice(
				errorMessage ||
					translate( "Something went wrong and we couldn't change your primary domain." ),
				{ duration: 10000, isPersistent: true }
			)
		);
	};
};
