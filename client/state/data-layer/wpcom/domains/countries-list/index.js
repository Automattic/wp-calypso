/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'client/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'client/state/data-layer/wpcom-http/utils';
import { COUNTRIES_DOMAINS_FETCH, COUNTRIES_DOMAINS_UPDATED } from 'client/state/action-types';
import { errorNotice } from 'client/state/notices/actions';

/**
 * Dispatches a request to fetch all available WordPress.com countries
 *
 * @param   {Function} dispatch Redux dispatcher
 * @param 	{String} action The action to dispatch next
 * @returns {Object} dispatched http action
 */
export const fetchCountriesDomains = ( { dispatch }, action ) =>
	dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'GET',
				path: '/domains/supported-countries/',
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
export const updateCountriesDomains = ( { dispatch }, action, countries ) =>
	dispatch( {
		type: COUNTRIES_DOMAINS_UPDATED,
		countries,
	} );

/**
 * Dispatches a error notice action when the request for the supported countries list fails.
 *
 * @param   {Function} dispatch Redux dispatcher
 * @returns {Object}            dispatched error notice action
 */
export const showCountriesDomainsLoadingError = ( { dispatch } ) =>
	dispatch( errorNotice( translate( "We couldn't load the countries list." ) ) );

export default {
	[ COUNTRIES_DOMAINS_FETCH ]: [
		dispatchRequest(
			fetchCountriesDomains,
			updateCountriesDomains,
			showCountriesDomainsLoadingError
		),
	],
};
