import { translate } from 'i18n-calypso';
import { COUNTRIES_PAYMENTS_FETCH, COUNTRIES_PAYMENTS_UPDATED } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';

/**
 * Dispatches a request to fetch all available WordPress.com countries
 *
 * @param 	{Object} action The action to dispatch next
 * @returns {Object} WordPress.com API HTTP Request action object
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
 * @param   {Object}   action   Redux action
 * @param   {Array}    countries  array of raw device data returned from the endpoint
 * @returns {Object}   Redux action
 */
export const updateCountriesTransactions = ( action, countries ) => ( {
	type: COUNTRIES_PAYMENTS_UPDATED,
	countries,
} );

/**
 * Dispatches a error notice action when the request for the supported countries list fails.
 *
 * @returns {Object}            dispatched error notice action
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
