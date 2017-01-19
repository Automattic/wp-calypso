/**
 * External Dependencies
 */

/**
 * Internal Dependencies
 */
import { SMS, DOMAIN, PAYMENT } from './constants';
import wp from 'lib/wp';
import {
	COUNTRIES_RECEIVE,
	COUNTRIES_REQUEST,
	COUNTRIES_REQUEST_FAILURE,
	COUNTRIES_REQUEST_SUCCESS
} from 'state/action-types';

const wpcom = wp.undocumented();

export function requestCountries( listType ) {
	return ( dispatch ) => {
		dispatch( {
			type: COUNTRIES_REQUEST,
			listType: listType
		} );
		let promise;
		switch ( listType ) {
			case SMS:
				promise = wpcom.getSmsSupportedCountries();
				break;
			case DOMAIN:
				promise = wpcom.getDomainRegistrationSupportedCountries();
				break;
			case PAYMENT:
				promise = wpcom.getPaymentSupportedCountries();
				break;
			default:
				promise = Promise.reject( new Error( 'requestCountries is missing a required type field or has invalid value' ) );
		}
		return promise.then( countries => {
			dispatch( { type: COUNTRIES_RECEIVE, listType, countries } );
			dispatch( { type: COUNTRIES_REQUEST_SUCCESS, listType } );
		} ).catch( error => {
			dispatch( { type: COUNTRIES_REQUEST_FAILURE, listType, error } );
		} );
	};
}
