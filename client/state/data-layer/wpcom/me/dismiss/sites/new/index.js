/**
 * @format
 */

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { READER_DISMISS_SITE, READER_DISMISS_POST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'state/notices/actions';

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
	return successNotice( translate( "We won't recommend you that site again." ), {
		duration: 5000,
	} );
}

export function receiveSiteDismissError() {
	return errorNotice( translate( 'Sorry, there was a problem dismissing that site.' ) );
}

export default {
	[ READER_DISMISS_SITE ]: [
		dispatchRequestEx( {
			fetch: requestSiteDismiss,
			onSuccess: receiveSiteDismiss,
			onError: receiveSiteDismissError,
			fromApi,
		} ),
	],
	[ READER_DISMISS_POST ]: [
		dispatchRequestEx( {
			fetch: requestSiteDismiss,
			onSuccess: receiveSiteDismiss,
			onError: receiveSiteDismissError,
			fromApi,
		} ),
	],
};
