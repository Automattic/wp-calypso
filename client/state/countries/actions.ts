import {
	COUNTRIES_DOMAINS_FETCH,
	COUNTRIES_SMS_FETCH,
	COUNTRIES_WOOCOMMERCE_FETCH,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/domains/countries-list/index.js';
import 'calypso/state/data-layer/wpcom/meta/sms-country-codes';
import 'calypso/state/data-layer/wpcom/woocommerce/countries/regions';
import 'calypso/state/countries/init';

export const fetchDomainCountries = () => ( { type: COUNTRIES_DOMAINS_FETCH } );

export const fetchSmsCountries = () => ( { type: COUNTRIES_SMS_FETCH } );

export const fetchWooCommerceCountries = () => ( { type: COUNTRIES_WOOCOMMERCE_FETCH } );
