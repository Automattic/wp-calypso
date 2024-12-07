/**
 */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { translate } from 'i18n-calypso';
import { closeAccountSuccess } from 'calypso/state/account/actions';
import { ACCOUNT_CLOSE } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';

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

export function receiveAccountCloseSuccess( _action, response ) {
	recordTracksEvent( 'calypso_account_closed' );
	return closeAccountSuccess( response );
}

export function receiveAccountCloseError( _action, error ) {
	if ( error.error === 'active-subscriptions' ) {
		return errorNotice(
			translate( 'This user account cannot be closed while it has active subscriptions.' )
		);
	}

	if ( error.error === 'active-memberships' ) {
		return errorNotice(
			translate( 'This user account cannot be closed while it has active purchases.' )
		);
	}

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
