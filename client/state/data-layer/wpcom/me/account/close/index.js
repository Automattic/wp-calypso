/**
 */

/**
 * External Dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { ACCOUNT_CLOSE } from 'calypso/state/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import { closeAccountSuccess } from 'calypso/state/account/actions';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

export function requestAccountClose( action ) {
	return http(
		{
			method: 'POST',
			apiVersion: '1.1',
			path: `/me/account/close`,
			body: {}, // have to have an empty body to make wpcom-http happy
		},
		action
	);
}

export function fromApi( response ) {
	// don't need to check for existence of response because errors are handled
	if ( ! response.success ) {
		throw new Error( 'Account closure was unsuccessful', response );
	}
	return response;
}

export function receiveAccountCloseSuccess() {
	recordTracksEvent( 'calypso_account_closed' );
	return closeAccountSuccess();
}

export function receiveAccountCloseError() {
	return errorNotice(
		translate( 'Sorry, there was a problem closing your account. Please contact support.' )
	);
}

registerHandlers( 'state/data-layer/wpcom/me/account/close/index.js', {
	[ ACCOUNT_CLOSE ]: [
		dispatchRequest( {
			fetch: requestAccountClose,
			onSuccess: receiveAccountCloseSuccess,
			onError: receiveAccountCloseError,
			fromApi,
		} ),
	],
} );
