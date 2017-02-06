/**
 * Internal Dependencies
 */
import { listTypes } from './constants';
import wp from 'lib/wp';
import {
	COUNTRIES_RECEIVE,
	COUNTRIES_REQUEST,
	COUNTRIES_REQUEST_FAILURE,
	COUNTRIES_REQUEST_SUCCESS
} from 'state/action-types';

const wpcom = wp.undocumented();

function requestCountries( listType ) {
	return ( dispatch ) => {
		dispatch( {
			type: COUNTRIES_REQUEST,
			listType: listType
		} );
		let promise;
		switch ( listType ) {
			case listTypes.SMS:
				promise = wpcom.getSmsSupportedCountries();
				break;
			case listTypes.DOMAIN:
				promise = wpcom.getDomainRegistrationSupportedCountries();
				break;
			case listTypes.PAYMENT:
				promise = wpcom.getPaymentSupportedCountries();
				break;
			default:
				promise = Promise.reject( new Error( 'requestCountries is missing a required type field or has invalid value' ) );
		}
		return promise.then( countries => {
			dispatch( { type: COUNTRIES_RECEIVE, listType, countries } );
			dispatch( { type: COUNTRIES_REQUEST_SUCCESS, listType } );
			return countries;
		} ).catch( error => {
			dispatch( { type: COUNTRIES_REQUEST_FAILURE, listType, error } );
			return Promise.reject( error );
		} );
	};
}

export function requestSMSSupportCountries() {
	return requestCountries( listTypes.SMS );
}

export function requestDomainRegistrationSupportedCountries() {
	return requestCountries( listTypes.DOMAIN );
}

export function requestPaymentSupportCountries() {
	return requestCountries( listTypes.PAYMENT );
}
