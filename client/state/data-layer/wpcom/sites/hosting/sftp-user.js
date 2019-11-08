/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import {
	HOSTING_SFTP_USER_REQUEST,
	HOSTING_SFTP_USER_CREATE,
	HOSTING_SFTP_PASSWORD_RESET,
} from 'state/action-types';
import { errorNotice } from 'state/notices/actions';
import { translate } from 'i18n-calypso';
import { updateAtomicSFTPUser } from 'state/hosting/actions.js';

const requestAtomicSFTPUser = action => {
	return http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/hosting/ssh-user`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);
};

const createAtomicSFTPUser = action => {
	return http(
		{
			method: 'POST',
			path: `/sites/${ action.siteId }/hosting/ssh-user`,
			apiNamespace: 'wpcom/v2',
			body: {},
		},
		action
	);
};

const resetAtomicSFTPPassword = action => {
	return http(
		{
			method: 'POST',
			path: `/sites/${ action.siteId }/hosting/ssh-user/reset-password`,
			apiNamespace: 'wpcom/v2',
			body: {},
		},
		action
	);
};

const receiveAtomicSFTPUserSuccess = ( action, response ) =>
	updateAtomicSFTPUser( action.siteId, action.userId, response );

const sFTPUserError = ( { siteId, userId } ) => dispatch => {
	dispatch( updateAtomicSFTPUser( siteId, userId, null ) );
	dispatch(
		errorNotice(
			translate(
				'Sorry, we had a problem retrieving your sftp user details. Please refresh the page and try again.'
			),
			{
				duration: 5000,
			}
		)
	);
};

registerHandlers( 'state/data-layer/wpcom/sites/hosting/sftp-user.js', {
	[ HOSTING_SFTP_USER_REQUEST ]: [
		dispatchRequest( {
			fetch: requestAtomicSFTPUser,
			onSuccess: receiveAtomicSFTPUserSuccess,
			onError: sFTPUserError,
		} ),
	],
	[ HOSTING_SFTP_USER_CREATE ]: [
		dispatchRequest( {
			fetch: createAtomicSFTPUser,
			onSuccess: receiveAtomicSFTPUserSuccess,
			onError: sFTPUserError,
		} ),
	],
	[ HOSTING_SFTP_PASSWORD_RESET ]: [
		dispatchRequest( {
			fetch: resetAtomicSFTPPassword,
			onSuccess: receiveAtomicSFTPUserSuccess,
			onError: sFTPUserError,
		} ),
	],
} );
