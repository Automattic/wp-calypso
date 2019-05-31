/** @format */

/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { updateConciergeSessionsCount } from 'state/concierge/actions';
import { CONCIERGE_SESSIONS_COUNT_REQUEST } from 'state/action-types';
import fromApi from './from-api';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const fetchConciergeSessionsCount = action =>
	http(
		{
			method: 'GET',
			path: '/concierge/sessions-count',
			apiNamespace: 'wpcom/v2',
		},
		action
	);

export const storeFetchedConciergeSessionsCount = ( action, count ) =>
	updateConciergeSessionsCount( count );

registerHandlers( 'state/data-layer/wpcom/concierge/sessions-count/index.js', {
	[ CONCIERGE_SESSIONS_COUNT_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchConciergeSessionsCount,
			onSuccess: storeFetchedConciergeSessionsCount,
			onError: noop,
			fromApi,
		} ),
	],
} );
