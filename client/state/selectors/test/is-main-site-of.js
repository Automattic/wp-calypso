/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isMainSiteOf from 'calypso/state/selectors/is-main-site-of';

describe( 'isMainSiteOf()', () => {
	test( 'should return null if no sites exist in state', () => {
		const state = {
			sites: {
				items: {},
			},
		};
		expect( isMainSiteOf( state, 1, 2 ) ).be.null;
	} );

	test( 'should return null if no site with id equal to mainSiteId exists in state', () => {
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
		expect( isMainSiteOf( state, 1, 2 ) ).be.null;
	} );

	test( 'should return null if no site with id equal to secondarySiteId exists in state', () => {
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
		expect( isMainSiteOf( state, 1, 2 ) ).be.null;
	} );

	test( 'should return false if site mainSiteId is not a main site', () => {
		const state = {
			sites: {
				items: {
					1: {
						ID: 1,
						is_multisite: true,
						jetpack: true,
						options: {
							unmapped_url: 'https://secondary.wordpress.com',
							main_network_site: 'https://example.wordpress.com',
						},
					},
					2: {
						ID: 2,
						is_multisite: true,
						jetpack: true,
						options: {
							unmapped_url: 'https://secondary2.wordpress.com',
							main_network_site: 'https://example.wordpress.com',
						},
					},
				},
			},
		};
		expect( isMainSiteOf( state, 1, 2 ) ).be.false;
	} );

	test( 'should return false if site secondarySiteId is not a secondary site', () => {
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
							main_network_site: 'https://secondary.wordpress.com',
						},
					},
				},
			},
		};
		expect( isMainSiteOf( state, 1, 2 ) ).be.false;
	} );

	test( 'should return false if site mainSiteId is not the main site of site secondarySiteId', () => {
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
							main_network_site: 'https://primary.wordpress.com',
						},
					},
				},
			},
		};
		expect( isMainSiteOf( state, 1, 2 ) ).be.false;
	} );

	test( 'should return true if site mainSiteId is the main site of site secondarySiteId', () => {
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
		expect( isMainSiteOf( state, 1, 2 ) ).be.true;
	} );
} );
