/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSiteRoles, isRequestingSiteRoles } from '../selectors';

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

			expect( isRequesting ).to.be.false;
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

			expect( isRequesting ).to.be.false;
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

			expect( isRequesting ).to.be.true;
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

			expect( siteRoles ).to.eql( roles );
		} );

		test( 'should return undefined if there is no such site', () => {
			const siteRoles = getSiteRoles( state, 87654321 );

			expect( siteRoles ).to.be.undefined;
		} );
	} );
} );
