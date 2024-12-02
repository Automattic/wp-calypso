import deepFreeze from 'deep-freeze';
import {
	HOSTING_CLEAR_CACHE_REQUEST,
	HOSTING_SFTP_USERS_SET,
	HOSTING_SFTP_USER_UPDATE,
} from 'calypso/state/action-types';
import reducer, { lastCacheClearTimestamp, sftpUsers } from '../reducer';

describe( 'reducer', () => {
	jest.spyOn( console, 'warn' ).mockImplementation();

	describe( '#lastCacheClearTimestamp', () => {
		const timestamp = 1664397666661;

		beforeAll( () => {
			jest.useFakeTimers( 'modern' ).setSystemTime( timestamp );
		} );

		afterAll( () => {
			jest.useRealTimers();
		} );

		test( 'should default to null', () => {
			const state = lastCacheClearTimestamp( undefined, {} );

			expect( state ).toEqual( null );
		} );

		test( 'should update to the current time whenever `HOSTING_CLEAR_CACHE_REQUEST` is dispatched', () => {
			const state = lastCacheClearTimestamp( undefined, {
				type: HOSTING_CLEAR_CACHE_REQUEST,
			} );

			expect( state ).toEqual( timestamp );
		} );
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
				lastCacheClearTimestamp: null,
				lastEdgeCacheClearTimestamp: null,
				geoAffinity: null,
				isFetchingGeoAffinity: null,
				phpVersion: null,
				sftpUsers: [ 1, 2, 3 ],
				sshAccess: null,
				staticFile404: null,
				isLoadingSftpUsers: false,
				isLoadingSshAccess: null,
				isFetchingWpVersion: false,
				wpVersion: null,
			},
		} );
	} );

	test( 'should accumulate sites', () => {
		const previousState = {
			12345678: {
				lastCacheClearTimestamp: null,
				lastEdgeCacheClearTimestamp: null,
				geoAffinity: null,
				isFetchingGeoAffinity: null,
				phpVersion: null,
				sftpUsers: [ 1, 2, 3 ],
				sshAccess: null,
				staticFile404: null,
				isLoadingSftpUsers: false,
				isLoadingSshAccess: null,
				isFetchingWpVersion: false,
				wpVersion: null,
			},
		};
		const state = reducer( previousState, {
			type: HOSTING_SFTP_USERS_SET,
			users: [ 9, 8, 7 ],
			siteId: 9876543,
		} );

		expect( state ).toEqual( {
			12345678: {
				lastCacheClearTimestamp: null,
				lastEdgeCacheClearTimestamp: null,
				geoAffinity: null,
				isFetchingGeoAffinity: null,
				phpVersion: null,
				sftpUsers: [ 1, 2, 3 ],
				sshAccess: null,
				staticFile404: null,
				isLoadingSftpUsers: false,
				isLoadingSshAccess: null,
				isFetchingWpVersion: false,
				wpVersion: null,
			},
			9876543: {
				lastCacheClearTimestamp: null,
				lastEdgeCacheClearTimestamp: null,
				geoAffinity: null,
				isFetchingGeoAffinity: null,
				phpVersion: null,
				sftpUsers: [ 9, 8, 7 ],
				sshAccess: null,
				staticFile404: null,
				isLoadingSftpUsers: false,
				isLoadingSshAccess: null,
				isFetchingWpVersion: false,
				wpVersion: null,
			},
		} );
	} );
} );
