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
	HOSTING_SFTP_USERS_REQUEST,
	HOSTING_SFTP_USER_CREATE,
	HOSTING_SFTP_PASSWORD_RESET,
} from 'state/action-types';
import { errorNotice } from 'state/notices/actions';
import { updateAtomicSftpUser, setAtomicSftpUsers } from 'state/hosting/actions';

export const requestAtomicSftpUsers = action => {
	return http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/hosting/ssh-users`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);
};

export const createAtomicSftpUser = action => {
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

export const resetAtomicSftpPassword = action => {
	return http(
		{
			method: 'POST',
			path: `/sites/${ action.siteId }/hosting/ssh-user/${ action.sshUsername }/reset-password`,
			apiNamespace: 'wpcom/v2',
			body: {},
		},
		action
	);
};

export const setSftpUsers = ( { siteId }, userList ) => {
	return setAtomicSftpUsers( siteId, userList );
};

export const updateSftpUser = ( action, userList ) =>
	updateAtomicSftpUser( action.siteId, userList );

export const displaySftpUserError = ( { siteId } ) => [
	updateAtomicSftpUser( siteId, null ),
	errorNotice(
		translate(
			'Sorry, we had a problem retrieving your sftp user details. Please refresh the page and try again.'
		),
		{
			duration: 5000,
			id: `get-ssh-users-error-${ siteId }`,
		}
	),
];

export const userToUserList = ( { username, password } ) => {
	return [ { username, password } ];
};

export const usernameListToUsers = ( { users } ) => {
	return users.map( user => ( {
		username: user,
	} ) );
};

registerHandlers( 'state/data-layer/wpcom/sites/hosting/sftp-user.js', {
	[ HOSTING_SFTP_USERS_REQUEST ]: [
		dispatchRequest( {
			fetch: requestAtomicSftpUsers,
			onSuccess: setSftpUsers,
			onError: displaySftpUserError,
			fromApi: usernameListToUsers,
		} ),
	],
	[ HOSTING_SFTP_USER_CREATE ]: [
		dispatchRequest( {
			fetch: createAtomicSftpUser,
			onSuccess: setSftpUsers,
			onError: displaySftpUserError,
			fromApi: userToUserList,
		} ),
	],
	[ HOSTING_SFTP_PASSWORD_RESET ]: [
		dispatchRequest( {
			fetch: resetAtomicSftpPassword,
			onSuccess: updateSftpUser,
			onError: displaySftpUserError,
			fromApi: userToUserList,
		} ),
	],
} );
