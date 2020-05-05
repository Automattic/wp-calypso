/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { COUNTRIES_PAYMENTS_FETCH, COUNTRIES_PAYMENTS_UPDATED } from 'state/action-types';
import { errorNotice } from 'state/notices/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * Dispatches a request to fetch all available WordPress.com countries
 *
 * @param 	{object} action The action to dispatch next
 * @returns {object} WordPress.com API HTTP Request action object
 */
export const fetchCountriesTransactions = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: '/me/transactions/supported-countries/',
		},
		action
	);

/**
 * Dispatches a countries updated action then the request for countries succeeded.
 *
 * @param   {object}   action   Redux action
 * @param   {Array}    countries  array of raw device data returned from the endpoint
 * @returns {object}   Redux action
 */
export const updateCountriesTransactions = ( action, countries ) => ( {
	type: COUNTRIES_PAYMENTS_UPDATED,
	countries,
} );

/**
 * Dispatches a error notice action when the request for the supported countries list fails.
 *
 * @returns {object}            dispatched error notice action
 */
export const showCountriesTransactionsLoadingError = () =>
	errorNotice( translate( "We couldn't load the countries list." ) );

export const dispatchCountriesTransactions = dispatchRequest( {
	fetch: fetchCountriesTransactions,
	onSuccess: updateCountriesTransactions,
	onError: showCountriesTransactionsLoadingError,
} );

registerHandlers( 'state/data-layer/wpcom/me/transactions/supported-countries/index.js', {
	[ COUNTRIES_PAYMENTS_FETCH ]: [ dispatchCountriesTransactions ],
} );
