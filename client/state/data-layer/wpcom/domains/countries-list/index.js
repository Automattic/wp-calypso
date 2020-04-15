/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { COUNTRIES_DOMAINS_FETCH, COUNTRIES_DOMAINS_UPDATED } from 'state/action-types';
import { errorNotice } from 'state/notices/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * Dispatches a request to fetch all available WordPress.com countries
 *
 * @param 	{string} action The action to dispatch next
 * @returns {object} dispatched http action
 */
export const fetchCountriesDomains = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: '/domains/supported-countries/',
		},
		action
	);

/**
 * Dispatches a countries updated action then the request for countries succeeded.
 *
 * @param   {object}   action   Redux action
 * @param   {Array}    countries  array of raw device data returned from the endpoint
 * @returns {object}            disparched user devices add action
 */
export const updateCountriesDomains = ( action, countries ) => ( {
	type: COUNTRIES_DOMAINS_UPDATED,
	countries,
} );

/**
 * Dispatches a error notice action when the request for the supported countries list fails.
 *
 * @param   {Function} dispatch Redux dispatcher
 * @returns {object}            dispatched error notice action
 */
export const showCountriesDomainsLoadingError = () =>
	errorNotice( translate( "We couldn't load the countries list." ) );

registerHandlers( 'state/data-layer/wpcom/domains/countries-list/index.js', {
	[ COUNTRIES_DOMAINS_FETCH ]: [
		dispatchRequest( {
			fetch: fetchCountriesDomains,
			onSuccess: updateCountriesDomains,
			onError: showCountriesDomainsLoadingError,
		} ),
	],
} );
