/**
 * Internal dependencies
 */

import {
	DOMAIN_REGISTRATION_COUNTRIES_REQUEST,
	DOMAIN_REGISTRATION_COUNTRIES_REQUEST_FAILURE,
	DOMAIN_REGISTRATION_COUNTRIES_REQUEST_SUCCESS,
	PAYMENTS_COUNTRIES_REQUEST,
	PAYMENTS_COUNTRIES_REQUEST_FAILURE,
	PAYMENTS_COUNTRIES_REQUEST_SUCCESS,
	SMS_COUNTRIES_REQUEST,
	SMS_COUNTRIES_REQUEST_FAILURE,
	SMS_COUNTRIES_REQUEST_SUCCESS,
} from 'state/action-types';

import wp from 'lib/wp';

/**
 * Module variables
 */
const wpcom = wp.undocumented();

const receiveCountries = ( countries, actions ) => {
	return {
		type: actions.success,
		countries
	};
};

export function requestCountries( actions, provider ) {
	return ( dispatch ) => {
		dispatch( {
			type: actions.request
		} );

		return provider()
			.then( ( countries ) => {
				dispatch( receiveCountries( countries, actions ) );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: actions.failure,
					error
				} );
			} );
	};
}

export function requestForDomainRegistrations() {
	return requestCountries( {
		request: DOMAIN_REGISTRATION_COUNTRIES_REQUEST,
		success: DOMAIN_REGISTRATION_COUNTRIES_REQUEST_SUCCESS,
		failure: DOMAIN_REGISTRATION_COUNTRIES_REQUEST_FAILURE
	}, () => {
		return wpcom.getDomainRegistrationSupportedCountries();
	} );
}

export function requestForPayments() {
	return requestCountries( {
		request: PAYMENTS_COUNTRIES_REQUEST,
		success: PAYMENTS_COUNTRIES_REQUEST_SUCCESS,
		failure: PAYMENTS_COUNTRIES_REQUEST_FAILURE
	}, () => {
		return wpcom.getPaymentSupportedCountries();
	} );
}

export function requestForSms() {
	return requestCountries( {
		request: SMS_COUNTRIES_REQUEST,
		success: SMS_COUNTRIES_REQUEST_SUCCESS,
		failure: SMS_COUNTRIES_REQUEST_FAILURE
	}, () => {
		return wpcom.getSmsSupportedCountries();
	} );
}
