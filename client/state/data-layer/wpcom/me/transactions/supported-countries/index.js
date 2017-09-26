/** @format */
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

/**
 * Dispatches a request to fetch all available WordPress.com countries
 *
 * @param   {Function} dispatch Redux dispatcher
 * @param 	{String} action The action to dispatch next
 * @returns {Object} dispatched http action
 */
export const fetchCountries = ( { dispatch }, action ) =>
	dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'GET',
				path: '/me/transactions/supported-countries/',
			},
			action
		)
	);

/**
 * Dispatches a countries updated action then the request for countries succeeded.
 *
 * @param   {Function} dispatch Redux dispatcher
 * @param   {Object}   action   Redux action
 * @param   {Array}    countries  array of raw device data returned from the endpoint
 * @returns {Object}            disparched user devices add action
 */
export const handleSuccess = ( { dispatch }, action, countries ) =>
	dispatch( {
		type: COUNTRIES_PAYMENTS_UPDATED,
		countries,
	} );

/**
 * Dispatches a error notice action when the request for the supported countries list fails.
 *
 * @param   {Function} dispatch Redux dispatcher
 * @returns {Object}            dispatched error notice action
 */
export const handleError = ( { dispatch } ) =>
	dispatch( errorNotice( translate( "We couldn't load the countries list." ) ) );

export default {
	[ COUNTRIES_PAYMENTS_FETCH ]: [ dispatchRequest( fetchCountries, handleSuccess, handleError ) ],
};
