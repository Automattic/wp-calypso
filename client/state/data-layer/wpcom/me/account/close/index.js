/**
 * @format
 */

/**
 * External Dependencies
 */
import { translate } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal Dependencies
 */
import { ACCOUNT_CLOSE } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';

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

export function receiveAccountCloseError() {
	return errorNotice(
		translate( 'Sorry, there was a problem closing your account. Please contact support.' )
	);
}

export default {
	[ ACCOUNT_CLOSE ]: [
		dispatchRequestEx( {
			fetch: requestAccountClose,
			onSuccess: noop,
			onError: receiveAccountCloseError,
			fromApi,
		} ),
	],
};
