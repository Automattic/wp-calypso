import { isMainNetworkSite, getJetpackSiteCollisions } from 'calypso/lib/site/utils';

describe( 'Site Utils', () => {
	describe( 'isMainNetworkSite', () => {
		test( 'Should return false when no site object is passed in.', () => {
			expect( isMainNetworkSite() ).toBe( false );
		} );

		test( 'Should return false when passed an empty object.', () => {
			expect( isMainNetworkSite( {} ) ).toBe( false );
		} );

		test( 'Should return false when passed an object without options.', () => {
			expect( isMainNetworkSite( { hello: 'not important' } ) ).toBe( false );
		} );

		test( 'Should return false when passed a multi site when unmapped_url and main_network_site are not equal.', () => {
			const site = {
				is_multisite: true,
				options: {
					unmapped_url: 'someurl',
					main_network_site: 'someurl-different',
				},
			};
			expect( isMainNetworkSite( site ) ).toBe( false );
		} );

		test( 'Should return true when passed a site a single site even though the unmapped_url is not the same as main_network_site.', () => {
			const site = {
				is_multisite: false,
				options: {
					unmapped_url: 'someurl',
					main_network_site: 'someurl-different',
				},
			};
			expect( isMainNetworkSite( site ) ).toBe( true );
		} );

		test( 'Should return false when passed a site that a part of a multi network.', () => {
			const site = {
				options: {
					is_multi_network: true,
				},
			};
			expect( isMainNetworkSite( site ) ).toBe( false );
		} );

		test( 'Should return true when passed a site that has different protocolls for unmapped_url and main_network_site.', () => {
			const site = {
				is_multisite: true,
				options: {
					unmapped_url: 'http://someurl',
					main_network_site: 'https://someurl',
				},
			};
			expect( isMainNetworkSite( site ) ).toBe( true );
		} );

		test( 'Should return false when passed a site that has compares ftp to http protocolls for unmapped_url and main_network_site.', () => {
			const site = {
				is_multisite: true,
				options: {
					unmapped_url: 'http://someurl',
					main_network_site: 'ftp://someurl',
				},
			};
			expect( isMainNetworkSite( site ) ).toBe( false );
		} );

		test( 'Does not explode when unmapped_url is not defined', () => {
			const site = {
				is_multisite: true,
				options: {},
			};
			expect( isMainNetworkSite( site ) ).toBe( false );
		} );
	} );

	describe( 'getJetpackSiteCollisions', () => {
		test( 'Should return an empty array when the list of sites is empty.', () => {
			expect( getJetpackSiteCollisions( [] ) ).toEqual( [] );
		} );

		test( 'Should return an empty array when there are no site collisions.', () => {
			const sitesNoCollisions = [
				{
					ID: 1111111111,
					URL: 'https://dummy1',
					jetpack: true,
				},
				{
					ID: 2222222222,
					URL: 'https://dummy2',
					jetpack: false,
				},
			];
			expect( getJetpackSiteCollisions( sitesNoCollisions ) ).toEqual( [] );
		} );

		test( 'Should return an array of IDs with the WP site collisioning with the Jetpack site.', () => {
			const sitesWithCollision = [
				{
					ID: 1111111111,
					URL: 'https://samedomain',
					jetpack: true,
				},
				{
					ID: 2222222222,
					URL: 'https://samedomain',
					jetpack: false,
				},
			];
			expect( getJetpackSiteCollisions( sitesWithCollision ) ).toEqual( [ 2222222222 ] );
		} );
	} );
} );
