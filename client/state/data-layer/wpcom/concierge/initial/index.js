/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { updateConciergeInitial } from 'state/concierge/actions';
import { errorNotice } from 'state/notices/actions';
import { CONCIERGE_INITIAL_REQUEST } from 'state/action-types';
import fromApi from './from-api';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const fetchConciergeInitial = ( action ) =>
	http(
		{
			method: 'GET',
			path: '/concierge/initial',
			apiNamespace: 'wpcom/v2',
			query: {
				site_id: action.siteId,
			},
		},
		action
	);

export const storeFetchedConciergeInitial = ( action, initial ) =>
	updateConciergeInitial( initial );

export const conciergeInitialFetchError = () =>
	errorNotice( translate( "We couldn't load our Concierge schedule. Please try again later." ) );

export const showConciergeInitialFetchError = () => conciergeInitialFetchError();

registerHandlers( 'state/data-layer/wpcom/concierge/schedules/initial/index.js', {
	[ CONCIERGE_INITIAL_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchConciergeInitial,
			onSuccess: storeFetchedConciergeInitial,
			onError: showConciergeInitialFetchError,
			fromApi,
		} ),
	],
} );
