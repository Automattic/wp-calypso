/**
 * Internal dependencies
 */
import { getSiteRoles, isRequestingSiteRoles, getWpcomFollowerRole } from '../selectors';

describe( 'selectors', () => {
	describe( '#isRequestingSiteRoles()', () => {
		test( 'should return false if roles have never been fetched for that site', () => {
			const isRequesting = isRequestingSiteRoles(
				{
					siteRoles: {
						requesting: {
							87654321: true,
						},
					},
				},
				12345678
			);

			expect( isRequesting ).toBe( false );
		} );

		test( 'should return false if roles are not being fetched for that site', () => {
			const isRequesting = isRequestingSiteRoles(
				{
					siteRoles: {
						requesting: {
							12345678: false,
						},
					},
				},
				12345678
			);

			expect( isRequesting ).toBe( false );
		} );

		test( 'should return true if the roles are being fetched for that site', () => {
			const isRequesting = isRequestingSiteRoles(
				{
					siteRoles: {
						requesting: {
							12345678: true,
						},
					},
				},
				12345678
			);

			expect( isRequesting ).toBe( true );
		} );
	} );

	describe( '#getSiteRoles()', () => {
		const roles = [
			{
				name: 'administrator',
				display_name: 'Administrator',
				capabilities: {
					activate_plugins: true,
					edit_users: true,
					manage_options: true,
				},
			},
			{
				name: 'customer',
				display_name: 'Customer',
				capabilities: {
					read: true,
				},
			},
		];
		const state = {
			siteRoles: {
				items: {
					12345678: roles,
				},
			},
		};

		test( 'should return the roles for the site ID', () => {
			const siteRoles = getSiteRoles( state, 12345678 );

			expect( siteRoles ).toEqual( roles );
		} );

		test( 'should return undefined if there is no such site', () => {
			const siteRoles = getSiteRoles( state, 87654321 );

			expect( siteRoles ).toBeUndefined();
		} );
	} );

	describe( '#getWpcomFollowerRole()', () => {
		test( 'should return Viewer if the site is private', () => {
			const stateIsPrivate = {
				sites: {
					items: {
						12345678: {
							is_private: true,
							is_coming_soon: false,
						},
					},
				},
			};
			const wpcomFollowerRole = getWpcomFollowerRole( stateIsPrivate, 12345678 );

			expect( wpcomFollowerRole.display_name ).toEqual( 'Viewer' );
		} );

		test( 'should return Viewer if the site is Coming Soon', () => {
			const stateIsPrivate = {
				sites: {
					items: {
						12345678: {
							is_private: false,
							is_coming_soon: true,
						},
					},
				},
			};
			const wpcomFollowerRole = getWpcomFollowerRole( stateIsPrivate, 12345678 );

			expect( wpcomFollowerRole.display_name ).toEqual( 'Viewer' );
		} );

		test( 'should return Follower if the site is not Coming Soon or Private', () => {
			const stateIsPrivate = {
				sites: {
					items: {
						12345678: {
							is_private: false,
							is_coming_soon: false,
						},
					},
				},
			};
			const wpcomFollowerRole = getWpcomFollowerRole( stateIsPrivate, 12345678 );

			expect( wpcomFollowerRole.display_name ).toEqual( 'Follower' );
		} );
	} );
} );
