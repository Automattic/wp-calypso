/**
 * Internal dependencies
 */
import {
	COUNTRIES_DOMAINS_FETCH,
	COUNTRIES_PAYMENTS_FETCH,
	COUNTRIES_SMS_FETCH,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/domains/countries-list/index.js';
import 'calypso/state/data-layer/wpcom/me/transactions/supported-countries';
import 'calypso/state/data-layer/wpcom/meta/sms-country-codes';
import 'calypso/state/countries/init';

export const fetchDomainCountries = () => ( { type: COUNTRIES_DOMAINS_FETCH } );

export const fetchPaymentCountries = () => ( { type: COUNTRIES_PAYMENTS_FETCH } );

export const fetchSmsCountries = () => ( { type: COUNTRIES_SMS_FETCH } );
