/**
 */

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { READER_DISMISS_SITE, READER_DISMISS_POST } from 'calypso/state/reader/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

export function requestSiteDismiss( action ) {
	return http(
		{
			method: 'POST',
			apiVersion: '1.1',
			path: `/me/dismiss/sites/${ action.payload.siteId }/new`,
			body: {}, // have to have an empty body to make wpcom-http happy
		},
		action
	);
}

export function fromApi( response ) {
	if ( ! response.success ) {
		throw new Error( 'Site dismiss was unsuccessful', response );
	}
	return response;
}

export function receiveSiteDismiss() {
	return successNotice( translate( "We won't recommend this site to you again." ), {
		duration: 5000,
	} );
}

export function receiveSiteDismissError() {
	return errorNotice( translate( 'Sorry, there was a problem dismissing that site.' ) );
}

registerHandlers( 'state/data-layer/wpcom/me/dismiss/sites/new/index.js', {
	[ READER_DISMISS_SITE ]: [
		dispatchRequest( {
			fetch: requestSiteDismiss,
			onSuccess: receiveSiteDismiss,
			onError: receiveSiteDismissError,
			fromApi,
		} ),
	],

	[ READER_DISMISS_POST ]: [
		dispatchRequest( {
			fetch: requestSiteDismiss,
			onSuccess: receiveSiteDismiss,
			onError: receiveSiteDismissError,
			fromApi,
		} ),
	],
} );
