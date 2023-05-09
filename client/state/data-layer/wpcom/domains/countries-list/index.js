import { translate } from 'i18n-calypso';
import { COUNTRIES_DOMAINS_FETCH, COUNTRIES_DOMAINS_UPDATED } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';

/**
 * Dispatches a request to fetch all available WordPress.com countries
 *
 * @param 	{string} action The action to dispatch next
 * @returns {Object} dispatched http action
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
 * @param   {Object}   action   Redux action
 * @param   {Array}    countries  array of raw device data returned from the endpoint
 * @returns {Object}            disparched user devices add action
 */
export const updateCountriesDomains = ( action, countries ) => ( {
	type: COUNTRIES_DOMAINS_UPDATED,
	countries,
} );

/**
 * Dispatches a error notice action when the request for the supported countries list fails.
 *
 * @returns {Object}            dispatched error notice action
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
