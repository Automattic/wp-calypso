/** @format */

/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { HELP_LINKS_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receiveHelpLinks } from 'state/help/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * Dispatches a request to fetch help links that match a certain search query
 *
 * @param   {Object} action Redux action
 * @returns {Object} Dispatched http action
 */
export const requestHelpLinks = action =>
	http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: '/help/search',
			query: {
				include_post_id: 1,
				query: action.query,
			},
		},
		action
	);

/**
 * Dispatches a help links receive action when the request succeeded.
 *
 * @param   {Object} action    Redux action
 * @param   {Object} helpLinks Help links
 * @returns {Object} Dispatched help links receive action
 */
export const handleRequestSuccess = ( action, helpLinks ) => receiveHelpLinks( helpLinks );

registerHandlers( 'state/data-layer/wpcom/help/search/index.js', {
	[ HELP_LINKS_REQUEST ]: [
		dispatchRequestEx( {
			fetch: requestHelpLinks,
			onSuccess: handleRequestSuccess,
			onError: noop,
		} ),
	],
} );
