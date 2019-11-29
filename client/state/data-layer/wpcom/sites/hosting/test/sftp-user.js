/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import {
	requestAtomicSftpUsers,
	createAtomicSftpUser,
	resetAtomicSftpPassword,
	setSftpUsers,
	updateSftpUser,
	displaySftpUserError,
	userToUserList,
	usernameListToUsers,
} from '../sftp-user';
import {
	HOSTING_SFTP_USERS_REQUEST,
	HOSTING_SFTP_USER_CREATE,
	HOSTING_SFTP_PASSWORD_RESET,
} from 'state/action-types';
import { errorNotice } from 'state/notices/actions';
import { updateAtomicSftpUser, setAtomicSftpUsers } from 'state/hosting/actions';

describe( 'requestAtomicSftpUsers', () => {
	it( 'should return an http action with the proper path', () => {
		const action = requestAtomicSftpUsers( {
			type: HOSTING_SFTP_USERS_REQUEST,
			siteId: 1,
		} );
		expect( action ).toHaveProperty( 'method', 'GET' );
		expect( action ).toHaveProperty( 'path', '/sites/1/hosting/ssh-users' );
		expect( action ).toHaveProperty( 'query.apiNamespace', 'wpcom/v2' );
	} );
} );

describe( 'createAtomicSftpUser', () => {
	it( 'should return an http action with the proper path', () => {
		const action = createAtomicSftpUser( {
			type: HOSTING_SFTP_USER_CREATE,
			siteId: 1,
		} );
		expect( action ).toHaveProperty( 'method', 'POST' );
		expect( action ).toHaveProperty( 'path', '/sites/1/hosting/ssh-user' );
		expect( action ).toHaveProperty( 'query.apiNamespace', 'wpcom/v2' );
	} );
} );

describe( 'resetAtomicSftpPassword', () => {
	it( 'should return an http action with the proper path', () => {
		const action = resetAtomicSftpPassword( {
			type: HOSTING_SFTP_PASSWORD_RESET,
			siteId: 1,
			sshUsername: 'test_ssh_username',
		} );
		expect( action ).toHaveProperty( 'method', 'POST' );
		expect( action ).toHaveProperty(
			'path',
			'/sites/1/hosting/ssh-user/test_ssh_username/reset-password'
		);
		expect( action ).toHaveProperty( 'query.apiNamespace', 'wpcom/v2' );
	} );
} );

describe( 'setSftpUsers', () => {
	it( 'should return a setAtomicSftpUsers with the users list', () => {
		const users = [];
		expect( setSftpUsers( { siteId: 1 }, users ) ).toEqual( setAtomicSftpUsers( 1, users ) );
	} );
} );

describe( 'updateSftpUser', () => {
	it( 'should return a updateAtomicSftpUser with the users list', () => {
		const users = [];
		expect( updateSftpUser( { siteId: 1 }, users ) ).toEqual( updateAtomicSftpUser( 1, users ) );
	} );
} );

describe( 'displaySftpUserError', () => {
	it( 'should return an array with the updateAtomicSftpUser and errorNotice actions', () => {
		const noticeAction = errorNotice(
			translate(
				'Sorry, we had a problem retrieving your sftp user details. Please refresh the page and try again.'
			),
			{
				duration: 5000,
				id: 'get-ssh-users-error-1',
			}
		);
		expect( displaySftpUserError( { siteId: 1 } ) ).toEqual( [
			updateAtomicSftpUser( 1, null ),
			noticeAction,
		] );
	} );
} );

describe( 'userToUserList', () => {
	it( 'should return an array of users with given user', () => {
		expect( userToUserList( { username: 'u', password: 'p' } ) ).toEqual( [
			{ username: 'u', password: 'p' },
		] );
	} );
} );

describe( 'usernameListToUsers', () => {
	it( 'should return an array of users with given usernames', () => {
		expect( usernameListToUsers( { users: [ 'u1', 'u2' ] } ) ).toEqual( [
			{ username: 'u1' },
			{ username: 'u2' },
		] );
	} );
} );
