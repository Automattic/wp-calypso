/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isConnectedSecondaryNetworkSite from 'calypso/state/selectors/is-connected-secondary-network-site';

describe( 'isConnectedSecondaryNetworkSite()', () => {
	test( 'should return false if no sites exist in state', () => {
		const state = {
			sites: {
				items: {},
			},
		};
		expect( isConnectedSecondaryNetworkSite( state, 1 ) ).be.false;
	} );

	test( 'should return false if site with id equal to siteId is not found', () => {
		const state = {
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
		expect( isConnectedSecondaryNetworkSite( state, 2 ) ).be.false;
	} );

	test( 'should return false if some is not yet loaded and with the loaded ones no conclusion can be taken', () => {
		const state = {
			sites: {
				items: {
					1: {},
					2: {
						ID: 2,
						is_multisite: true,
						jetpack: true,
						options: {
							unmapped_url: 'https://secondary.wordpress.com',
							main_network_site: 'https://example.wordpress.com',
						},
					},
				},
			},
		};
		expect( isConnectedSecondaryNetworkSite( state, 2 ) ).be.false;
	} );

	test( 'should return false if site with id equal to siteId is a secondary site but the main site is not part of the state', () => {
		const state = {
			sites: {
				items: {
					2: {
						ID: 2,
						is_multisite: true,
						jetpack: true,
						options: {
							unmapped_url: 'https://secondary.wordpress.com',
							main_network_site: 'https://example.wordpress.com',
						},
					},
				},
			},
		};
		expect( isConnectedSecondaryNetworkSite( state, 2 ) ).be.false;
	} );

	test( 'should return false if site with id equal to siteId is not a secondary network site', () => {
		const state = {
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
		expect( isConnectedSecondaryNetworkSite( state, 1 ) ).be.false;
	} );

	test( 'should return true if site with id equal to siteId is a connected secondary network site', () => {
		const state = {
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
				},
			},
		};
		expect( isConnectedSecondaryNetworkSite( state, 2 ) ).be.true;
	} );
} );
