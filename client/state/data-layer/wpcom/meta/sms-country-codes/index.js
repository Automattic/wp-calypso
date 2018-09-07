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
import { COUNTRIES_SMS_FETCH, COUNTRIES_SMS_UPDATED } from 'state/action-types';
import { errorNotice } from 'state/notices/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * Dispatches a request to fetch all available WordPress.com countries
 *
 * @param   {Function} dispatch Redux dispatcher
 * @param 	{String} action The action to dispatch next
 * @returns {Object} dispatched http action
 */
export const fetchCountriesSms = ( { dispatch }, action ) =>
	dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'GET',
				path: '/meta/sms-country-codes/',
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
export const updateCountriesSms = ( { dispatch }, action, countries ) =>
	dispatch( {
		type: COUNTRIES_SMS_UPDATED,
		countries,
	} );

/**
 * Dispatches a error notice action when the request for the supported countries list fails.
 *
 * @param   {Function} dispatch Redux dispatcher
 * @returns {Object}            dispatched error notice action
 */
export const showCountriesSmsLoadingError = ( { dispatch } ) =>
	dispatch( errorNotice( translate( "We couldn't load the countries list." ) ) );

registerHandlers( 'state/data-layer/wpcom/meta/sms-country-codes/index.js', {
	[ COUNTRIES_SMS_FETCH ]: [
		dispatchRequest( fetchCountriesSms, updateCountriesSms, showCountriesSmsLoadingError ),
	],
} );

export default {};
