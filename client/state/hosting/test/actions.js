/**
 * Internal dependencies
 */
import {
	restoreDatabasePassword,
	requestAtomicSftpUsers,
	setAtomicSftpUsers,
	updateAtomicSftpUser,
	createAtomicSftpUser,
	resetAtomicSftpPassword,
} from '../actions';
import {
	HOSTING_RESTORE_DATABASE_PASSWORD,
	HOSTING_SFTP_USER_CREATE,
	HOSTING_SFTP_USERS_REQUEST,
	HOSTING_SFTP_PASSWORD_RESET,
	HOSTING_SFTP_USER_UPDATE,
	HOSTING_SFTP_USERS_SET,
} from 'state/action-types';

describe( 'actions', () => {
	describe( 'restoreDatabasePassword()', () => {
		test( 'should return an action', () => {
			expect( restoreDatabasePassword( 12345678 ) ).toEqual( {
				type: HOSTING_RESTORE_DATABASE_PASSWORD,
				siteId: 12345678,
			} );
		} );
	} );

	describe( 'requestAtomicSftpUsers()', () => {
		test( 'should return an action', () => {
			expect( requestAtomicSftpUsers( 12345678 ) ).toEqual( {
				type: HOSTING_SFTP_USERS_REQUEST,
				siteId: 12345678,
			} );
		} );
	} );

	describe( 'setAtomicSftpUsers()', () => {
		test( 'should return an action', () => {
			expect( setAtomicSftpUsers( 12345678, [] ) ).toEqual( {
				type: HOSTING_SFTP_USERS_SET,
				siteId: 12345678,
				users: [],
			} );
		} );
	} );

	describe( 'updateAtomicSftpUser()', () => {
		test( 'should return an action', () => {
			expect( updateAtomicSftpUser( 12345678, [] ) ).toEqual( {
				type: HOSTING_SFTP_USER_UPDATE,
				siteId: 12345678,
				users: [],
			} );
		} );
	} );

	describe( 'createAtomicSftpUser()', () => {
		test( 'should return an action', () => {
			expect( createAtomicSftpUser( 12345678, 987654 ) ).toEqual( {
				type: HOSTING_SFTP_USER_CREATE,
				siteId: 12345678,
				userId: 987654,
			} );
		} );
	} );

	describe( 'resetAtomicSftpPassword()', () => {
		test( 'should return an action', () => {
			expect( resetAtomicSftpPassword( 12345678, 'test_ssh_username' ) ).toEqual( {
				type: HOSTING_SFTP_PASSWORD_RESET,
				siteId: 12345678,
				sshUsername: 'test_ssh_username',
			} );
		} );
	} );
} );
