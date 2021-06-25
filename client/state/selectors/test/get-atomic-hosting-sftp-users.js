/**
 * Internal dependencies
 */
import { getAtomicHostingSftpUsers } from 'calypso/state/selectors/get-atomic-hosting-sftp-users';

describe( 'getAtomicHostingSftpUsers()', () => {
	test( 'should return null if there is no hosting data', () => {
		const state = {};
		const users = getAtomicHostingSftpUsers( state, 123 );

		expect( users ).toBeNull();
	} );

	test( 'should return null if the site is not tracked', () => {
		const state = {
			atomicHosting: {
				123: {
					sftpUsers: [
						{ username: 'u1', password: 'p1' },
						{ username: 'u2', password: 'p3' },
						{ username: 'u3', password: 'p3' },
					],
				},
			},
		};
		const users = getAtomicHostingSftpUsers( state, 124 );

		expect( users ).toBeNull();
	} );

	test( 'should return null if there are no users data', () => {
		const state = {
			atomicHosting: {
				123: {},
			},
		};
		const users = getAtomicHostingSftpUsers( state, 123 );

		expect( users ).toBeNull();
	} );

	test( 'should return list of users', () => {
		const state = {
			atomicHosting: {
				123: {
					sftpUsers: [
						{ username: 'u1', password: 'p1' },
						{ username: 'u2', password: 'p3' },
						{ username: 'u3', password: 'p3' },
					],
				},
			},
		};
		const users = getAtomicHostingSftpUsers( state, 123 );

		expect( users ).toEqual( [
			{ username: 'u1', password: 'p1' },
			{ username: 'u2', password: 'p3' },
			{ username: 'u3', password: 'p3' },
		] );
	} );
} );
