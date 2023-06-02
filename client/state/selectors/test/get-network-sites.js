import getNetworkSites from 'calypso/state/selectors/get-network-sites';
import { userState } from './fixtures/user-state';

describe( 'getNetworkSites()', () => {
	test( 'should return null if no sites exist in state', () => {
		const state = {
			...userState,
			sites: {
				items: {},
			},
		};
		expect( getNetworkSites( state, 1 ) ).toBeNull();
	} );

	test( 'should return null if main site is not found', () => {
		const state = {
			...userState,
			sites: {
				items: {
					1: {
						ID: 1,
						is_multisite: true,
						jetpack: true,
						options: {
							unmapped_url: 'https://example.wordpress.com',
							main_network_site: 'https://example.wordpress.com',
						},
					},
				},
			},
		};
		expect( getNetworkSites( state, 2 ) ).toBeNull();
	} );

	test( 'should return null if site is not a main site', () => {
		const state = {
			...userState,
			sites: {
				items: {
					1: {
						ID: 1,
						name: 'WordPress.com Example Blog',
						URL: 'https://example.com',
						jetpack: true,
					},
				},
			},
		};
		expect( getNetworkSites( state, 1 ) ).toBeNull();
	} );

	test( 'should return only the main site if no secondary sites exist', () => {
		const state = {
			...userState,
			sites: {
				items: {
					1: {
						ID: 1,
						name: 'WordPress.com Example Blog',
						URL: 'https://example.com',
						jetpack: true,
						is_multisite: true,
						options: {
							unmapped_url: 'https://example.com',
							main_network_site: 'https://example.com',
						},
					},
				},
			},
		};
		const networkSites = getNetworkSites( state, 1 );
		expect( Array.isArray( networkSites ) ).toBe( true );
		expect( networkSites ).toHaveLength( 1 );
		expect( networkSites[ 0 ].ID ).toEqual( 1 );
	} );

	test( 'should return an array with secondary sites if they exist', () => {
		const state = {
			...userState,
			sites: {
				items: {
					1: {
						ID: 1,
						is_multisite: true,
						jetpack: true,
						options: {
							unmapped_url: 'https://example.wordpress.com',
							main_network_site: 'https://example.wordpress.com',
						},
					},
					2: {
						ID: 2,
						is_multisite: true,
						jetpack: true,
						options: {
							unmapped_url: 'https://secondary.wordpress.com',
							main_network_site: 'https://example.wordpress.com',
						},
					},
					3: {
						ID: 3,
						is_multisite: true,
						jetpack: true,
						options: {
							unmapped_url: 'https://secondary3.wordpress.com',
							main_network_site: 'https://example.wordpress.com',
						},
					},
				},
			},
		};
		const networkSites = getNetworkSites( state, 1 );
		expect( Array.isArray( networkSites ) ).toBe( true );
		expect( networkSites ).toHaveLength( 3 );
		expect( networkSites[ 0 ].ID ).toEqual( 1 );
		expect( networkSites[ 1 ].ID ).toEqual( 2 );
		expect( networkSites[ 2 ].ID ).toEqual( 3 );
	} );
} );
