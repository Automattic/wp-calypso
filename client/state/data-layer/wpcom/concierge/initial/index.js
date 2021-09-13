import { translate } from 'i18n-calypso';
import { CONCIERGE_INITIAL_REQUEST } from 'calypso/state/action-types';
import { updateConciergeInitial } from 'calypso/state/concierge/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import fromApi from './from-api';

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

export const conciergeInitialFetchError = ( errorMessage ) => errorNotice( errorMessage );

const unauthorizedError = ( errorMessage ) => errorNotice( errorMessage );

export const showConciergeInitialFetchError = ( action ) => {
	const errorCode = action?.meta?.dataLayer?.error?.code;
	const errorMessage =
		action?.meta?.dataLayer?.error?.message ||
		translate( 'Something went wrong with Quick Start. Please try again later.' );
	if ( 'rest_concierge_access_denied' === errorCode ) {
		return unauthorizedError( errorMessage );
	}

	return conciergeInitialFetchError( errorMessage );
};

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
