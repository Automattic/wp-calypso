/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getJetpackSites from 'calypso/state/selectors/get-jetpack-sites';
import { userState } from './fixtures/user-state';

describe( 'getJetpackSites()', () => {
	test( 'should return an empty array if no sites exist in state', () => {
		const state = {
			...userState,
			sites: {
				items: {},
			},
		};
		const sites = getJetpackSites( state );
		expect( sites ).to.eql( [] );
	} );

	test( 'should return an empty array if the sites existing are not Jetpack sites', () => {
		const state = {
			...userState,
			sites: {
				items: {
					2916287: { ID: 2916287, name: 'WordPress.com Example Blog' },
					2916286: { ID: 2916286, name: 'WordPress.com Example Blog' },
				},
			},
		};
		const sites = getJetpackSites( state );
		expect( sites ).to.eql( [] );
	} );

	test( 'should return one Jetpack site if only one site exists and it is a Jetpack site', () => {
		const state = {
			...userState,
			sites: {
				items: {
					2916289: {
						ID: 2916289,
						jetpack: true,
						options: {
							unmapped_url: 'https://example.wordpress.com',
						},
					},
				},
			},
		};
		const sites = getJetpackSites( state );
		expect( sites ).to.have.length( 1 );
		expect( sites[ 0 ].ID ).to.eql( 2916289 );
	} );

	test( 'should return all the sites in state if all of them are Jetpack sites', () => {
		const state = {
			...userState,
			sites: {
				items: {
					2916288: {
						ID: 2916288,
						jetpack: true,
					},
					2916289: {
						ID: 2916289,
						jetpack: true,
						options: {
							unmapped_url: 'https://example2.wordpress.com',
						},
					},
				},
			},
			siteSettings: {
				items: {},
			},
		};
		const sites = getJetpackSites( state );
		expect( sites ).to.have.length( 2 );
		expect( sites[ 0 ].ID ).to.eql( 2916288 );
		expect( sites[ 1 ].ID ).to.eql( 2916289 );
	} );

	test( 'should return only the Jetpack sites if the state contains Jetpack and non Jetpack sites', () => {
		const state = {
			...userState,
			sites: {
				items: {
					2916288: {
						ID: 2916288,
						jetpack: true,
					},
					2916287: {
						ID: 2916287,
						name: 'WordPress.com Example Blog',
					},
					2916289: {
						ID: 2916289,
						jetpack: true,
					},
					2916286: {
						ID: 2916286,
						name: 'WordPress.com Example Blog',
					},
				},
			},
			siteSettings: {
				items: {},
			},
		};
		const sites = getJetpackSites( state );
		expect( sites ).to.have.length( 2 );
		expect( sites[ 0 ].ID ).to.eql( 2916288 );
		expect( sites[ 1 ].ID ).to.eql( 2916289 );
	} );
} );
