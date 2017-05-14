/**
 * Internal dependencies
 */
import {
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_RECEIVE,
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_REQUEST,
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_REQUEST_FAILURE,
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_REQUEST_SUCCESS,
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_SAVE,
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_SAVE_FAILURE,
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_SAVE_SUCCESS,
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_UPDATE,
} from 'state/action-types';

const fauxApiResponse = {
	first_name: "Testy",
	last_name: "McTesta",
}

/**
 * Returns an action object to be used in signalling that a domains contact details  object
 * has been received.
 *
 * @param	{String}   domain			domain queried
 * @param   {Object}   contactDetails	contact details object
 * @returns {Object}   Action object
 */
export function receiveDomainContactDetails( domain, contactDetails ) {
	return {
		type: DOMAINS_MANAGEMENT_CONTACT_DETAILS_RECEIVE,
		domain,
		contactDetails
	};
}

/**
 * Triggers a network request to query domain contact details
 * @param   {String}   domain	domain to query
 * @returns {Function}          Action thunk
 */
export function requestDomainContactDetails( domain ) {
	return ( dispatch ) => {
		dispatch( {
			type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_REQUEST,
			domain
		} );

		dispatch( receiveDomainContactDetails( domain, fauxApiResponse ) );

		return dispatch( { type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_REQUEST_SUCCESS } );
	};
}

export function saveDomainContactDetails( domain, contactDetails ) {
	return ( dispatch ) => {
		dispatch( {
			type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_SAVE,
			domain
		} );

		return wpcom.undocumented().domains( domain, 'post', contactDetails )
			.then( ( { updated } ) => {
				dispatch( updateDomainContactDetails( domain, updated ) );
				dispatch( {
					type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_SAVE_SUCCESS,
					domain
				} );
			} )
			.catch( error => {
				dispatch( {
					type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_SAVE_FAILURE,
					domain,
					error
				} );
			} );
	};
}

export function updateDomainContactDetails( domain, contactDetails ) {
	return {
		type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_UPDATE,
		domain,
		contactDetails
	}
}

