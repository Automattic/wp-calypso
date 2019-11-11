/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';

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
import { updateAtomicSftpUser } from 'state/hosting/actions';

const requestAtomicSftpUser = action => {
	return http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/hosting/ssh-user`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);
};

const createAtomicSftpUser = action => {
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

const resetAtomicSftpPassword = action => {
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

const receiveAtomicSftpUserSuccess = ( action, { username, password } ) =>
	updateAtomicSftpUser( action.siteId, action.userId, { username, password } );

const sftpUserError = ( { siteId, userId } ) => [
	updateAtomicSftpUser( siteId, userId, null ),
	errorNotice(
		translate(
			'Sorry, we had a problem retrieving your sftp user details. Please refresh the page and try again.'
		),
		{
			duration: 5000,
		}
	),
];

registerHandlers( 'state/data-layer/wpcom/sites/hosting/sftp-user.js', {
	[ HOSTING_SFTP_USER_REQUEST ]: [
		dispatchRequest( {
			fetch: requestAtomicSftpUser,
			onSuccess: receiveAtomicSftpUserSuccess,
			onError: sftpUserError,
		} ),
	],
	[ HOSTING_SFTP_USER_CREATE ]: [
		dispatchRequest( {
			fetch: createAtomicSftpUser,
			onSuccess: receiveAtomicSftpUserSuccess,
			onError: sftpUserError,
		} ),
	],
	[ HOSTING_SFTP_PASSWORD_RESET ]: [
		dispatchRequest( {
			fetch: resetAtomicSftpPassword,
			onSuccess: receiveAtomicSftpUserSuccess,
			onError: sftpUserError,
		} ),
	],
} );
