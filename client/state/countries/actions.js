/**
 * Internal dependencies
 */
import {
	COUNTRIES_DOMAINS_FETCH,
	COUNTRIES_PAYMENTS_FETCH,
	COUNTRIES_SMS_FETCH,
} from 'state/action-types';

import 'state/data-layer/wpcom/domains/countries-list/index.js';
import 'state/data-layer/wpcom/me/transactions/supported-countries';
import 'state/data-layer/wpcom/meta/sms-country-codes';

export const fetchDomainCountries = () => ( { type: COUNTRIES_DOMAINS_FETCH } );

export const fetchPaymentCountries = () => ( { type: COUNTRIES_PAYMENTS_FETCH } );

export const fetchSmsCountries = () => ( { type: COUNTRIES_SMS_FETCH } );
