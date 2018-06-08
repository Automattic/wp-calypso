/** @format */

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import makeJsonSchemaParser from 'lib/make-json-schema-parser';
import schema from './schema';
import {
	PURCHASES_USER_FETCH,
	PURCHASES_USER_FETCH_COMPLETED,
	PURCHASES_USER_FETCH_FAILED,
} from 'state/action-types';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import {} from 'state/purchases/actions';

/**
 * Dispatches a request to fetch connected applications of the current user
 *
 * @param   {Object} action Redux action
 * @returns {Object} Dispatched http action
 */
export const fetchUserPurchases = action =>
	http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: '/me/purchases',
		},
		action
	);

/**
 * @TODO (@sirreal)
 *
 * Replace purchases assembler invoked by selector with a transformer
 */
export const transformer = undefined;

export default {
	[ PURCHASES_USER_FETCH ]: [
		dispatchRequestEx( {
			fetch: fetchUserPurchases,
			onSuccess: ( { userId }, purchases ) => ( {
				type: PURCHASES_USER_FETCH_COMPLETED,
				userId,
				purchases,
			} ),
			onError: () => ( {
				type: PURCHASES_USER_FETCH_FAILED,
				error: translate( 'There was an error retrieving purchases.' ),
			} ),
			fromApi: makeJsonSchemaParser( schema, transformer ),
		} ),
	],
};
