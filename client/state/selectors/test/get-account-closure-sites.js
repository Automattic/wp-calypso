/**
 * Internal dependencies
 */
import getAccountClosureSites from 'calypso/state/selectors/get-account-closure-sites';
import { userState } from './fixtures/user-state';

describe( 'getAccountClosureSites()', () => {
	test( 'should return an empty array if no sites in state', () => {
		const state = {
			...userState,
			sites: {
				items: {},
			},
		};
		const sites = getAccountClosureSites( state );
		expect( sites ).toEqual( [] );
	} );

	test( 'should not return any Jetpack sites', () => {
		const state = {
			...userState,
			sites: {
				items: {
					2916284: {
						ID: 2916284,
						jetpack: true,
						name: 'WordPress.com Example Blog',
						URL: 'http://example.com',
						capabilities: {
							own_site: true,
						},
					},
				},
			},
			siteSettings: {
				items: {},
			},
		};
		const sites = getAccountClosureSites( state );
		expect( sites ).toEqual( [] );
	} );

	test( 'should not return any sites the user is not an admin on', () => {
		const state = {
			...userState,
			sites: {
				items: {
					2916284: {
						ID: 2916284,
						jetpack: false,
						name: 'WordPress.com Example Blog',
						URL: 'http://example.com',
						capabilities: {
							own_site: false,
							publish_posts: true,
						},
					},
				},
			},
			siteSettings: {
				items: {},
			},
		};
		const sites = getAccountClosureSites( state );
		expect( sites ).toEqual( [] );
	} );

	test( 'should return sites that are not Jetpack and user is an admin on', () => {
		const state = {
			...userState,
			sites: {
				items: {
					2916284: {
						ID: 2916284,
						jetpack: false,
						name: 'WordPress.com Example Blog',
						URL: 'http://example.com',
						capabilities: {
							own_site: true,
						},
					},
				},
			},
			siteSettings: {
				items: {},
			},
		};
		const sites = getAccountClosureSites( state );
		expect( sites ).not.toEqual( [] );
	} );
} );
