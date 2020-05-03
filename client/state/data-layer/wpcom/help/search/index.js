/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { HELP_LINKS_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receiveHelpLinks } from 'state/help/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * Dispatches a request to fetch help links that match a certain search query
 *
 * @param   {object} action Redux action
 * @returns {object} Dispatched http action
 */
export const requestHelpLinks = ( action ) =>
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
 * @param   {object} action    Redux action
 * @param   {object} helpLinks Help links
 * @returns {object} Dispatched help links receive action
 */
export const handleRequestSuccess = ( action, helpLinks ) => receiveHelpLinks( helpLinks );

registerHandlers( 'state/data-layer/wpcom/help/search/index.js', {
	[ HELP_LINKS_REQUEST ]: [
		dispatchRequest( {
			fetch: requestHelpLinks,
			onSuccess: handleRequestSuccess,
			onError: noop,
		} ),
	],
} );
