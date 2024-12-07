import { translate } from 'i18n-calypso';
import { AccountRestoreActionType } from 'calypso/state/account/types';
import {
	ACCOUNT_RESTORE,
	ACCOUNT_RESTORE_SUCCESS,
	ACCOUNT_RESTORE_FAILED,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

export function requestAccountRestore( action: AccountRestoreActionType ) {
	const { token } = action.payload;
	return http(
		{
			method: 'POST',
			apiVersion: '1.1',
			path: `/me/account/restore`,
			body: {
				token,
			},
		},
		action
	);
}

function receiveAccountRestoreSuccess() {
	return [
		{ type: ACCOUNT_RESTORE_SUCCESS },
		() => {
			// wait before redirecting to let the user see the success notice
			setTimeout( () => {
				window.location.href = '/sites?restored=true';
			}, 2000 );
		},
		successNotice( translate( 'Your account has been restored. Redirecting back to login.' ) ),
	];
}

function receiveAccountRestoreError( action: AccountRestoreActionType, error: { error: string } ) {
	if ( error.error === 'invalid_token' ) {
		return [
			{ type: ACCOUNT_RESTORE_FAILED },
			errorNotice(
				translate(
					'Invalid token. Please check your account deleted email for the correct link or contact support.'
				)
			),
		];
	}
	return [
		{ type: ACCOUNT_RESTORE_FAILED },
		errorNotice(
			translate( 'Sorry, there was a problem restoring your account. Please contact support.' )
		),
	];
}

registerHandlers( 'state/data-layer/wpcom/me/account/restore/index.js', {
	[ ACCOUNT_RESTORE ]: [
		dispatchRequest( {
			fetch: requestAccountRestore,
			onSuccess: receiveAccountRestoreSuccess,
			onError: receiveAccountRestoreError,
		} ),
	],
} );
