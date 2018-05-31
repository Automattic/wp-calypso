/**
 * Internal dependencies
 */
import {
	COUNTRIES_DOMAINS_FETCH,
	COUNTRIES_PAYMENTS_FETCH,
	COUNTRIES_SMS_FETCH
} from 'state/action-types';

export const fetchDomainCountries = () => ( { type: COUNTRIES_DOMAINS_FETCH } );

export const fetchPaymentCountries = () => ( { type: COUNTRIES_PAYMENTS_FETCH } );

export const fetchSmsCountries = () => ( { type: COUNTRIES_SMS_FETCH } );
