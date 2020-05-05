/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { sftpUsers } from '../reducer';
import { HOSTING_SFTP_USERS_SET, HOSTING_SFTP_USER_UPDATE, SERIALIZE } from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	describe( '#sftpUsers()', () => {
		test( 'should default to an empty object', () => {
			const state = sftpUsers( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should set given users', () => {
			const state = sftpUsers( undefined, {
				type: HOSTING_SFTP_USERS_SET,
				users: [ 1, 2, 3 ],
			} );

			expect( state ).toEqual( [ 1, 2, 3 ] );
		} );

		test( 'should override previous users', () => {
			const previousState = deepFreeze( [ 1, 2, 3 ] );
			const state = sftpUsers( previousState, {
				type: HOSTING_SFTP_USERS_SET,
				users: [ 4, 5, 6 ],
			} );

			expect( state ).toEqual( [ 4, 5, 6 ] );
		} );

		test( 'should persist state', () => {
			const previousState = deepFreeze( [ 1, 2, 3 ] );
			const state = sftpUsers( previousState, { type: SERIALIZE } );

			expect( state ).toEqual( [ 1, 2, 3 ] );
		} );

		test( 'should update existing users', () => {
			const previousState = deepFreeze( [
				{ username: 'u1', password: 'p1' },
				{ username: 'u2', password: 'p2' },
				{ username: 'u3', password: 'p3' },
			] );
			const state = sftpUsers( previousState, {
				type: HOSTING_SFTP_USER_UPDATE,
				users: [ { username: 'u2', password: 'p2-updated' } ],
			} );

			expect( state ).toEqual( [
				{ username: 'u1', password: 'p1' },
				{ username: 'u2', password: 'p2-updated' },
				{ username: 'u3', password: 'p3' },
			] );
		} );

		test( 'should not update non-existing users', () => {
			const previousState = deepFreeze( [
				{ username: 'u1', password: 'p1' },
				{ username: 'u2', password: 'p2' },
				{ username: 'u3', password: 'p3' },
			] );
			const state = sftpUsers( previousState, {
				type: HOSTING_SFTP_USER_UPDATE,
				users: [ { username: 'u4', password: 'p4' } ],
			} );

			expect( state ).toEqual( [
				{ username: 'u1', password: 'p1' },
				{ username: 'u2', password: 'p2' },
				{ username: 'u3', password: 'p3' },
			] );
		} );

		test( 'should not update if there are no users', () => {
			const state = sftpUsers( undefined, {
				type: HOSTING_SFTP_USER_UPDATE,
				users: [ { username: 'u1', password: 'p1' } ],
			} );

			expect( state ).toEqual( {} );
		} );
	} );

	test( 'should default to an empty object', () => {
		const state = reducer( undefined, {} );

		expect( state ).toEqual( {} );
	} );

	test( 'should map site ID', () => {
		const state = reducer( undefined, {
			type: HOSTING_SFTP_USERS_SET,
			users: [ 1, 2, 3 ],
			siteId: 12345678,
		} );

		expect( state ).toEqual( {
			12345678: {
				phpVersion: null,
				sftpUsers: [ 1, 2, 3 ],
			},
		} );
	} );

	test( 'should accumulate sites', () => {
		const previousState = {
			12345678: {
				phpVersion: null,
				sftpUsers: [ 1, 2, 3 ],
			},
		};
		const state = reducer( previousState, {
			type: HOSTING_SFTP_USERS_SET,
			users: [ 9, 8, 7 ],
			siteId: 9876543,
		} );

		expect( state ).toEqual( {
			12345678: {
				phpVersion: null,
				sftpUsers: [ 1, 2, 3 ],
			},
			9876543: {
				phpVersion: null,
				sftpUsers: [ 9, 8, 7 ],
			},
		} );
	} );
} );
