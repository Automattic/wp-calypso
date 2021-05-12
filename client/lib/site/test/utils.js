/**
 * External dependencies
 */
import chai from 'chai';

/**
 * Internal dependencies
 */
import { canUpdateFiles, isMainNetworkSite } from 'calypso/lib/site/utils';

const assert = chai.assert;

describe( 'Site Utils', () => {
	describe( 'canUpdateFiles', () => {
		test( 'Should have a method canUpdateFiles.', () => {
			assert.isFunction( canUpdateFiles );
		} );

		test( 'Should return false when no site object is passed in.', () => {
			assert.isFalse( canUpdateFiles() );
		} );

		test( 'Should return false when passed an empty object.', () => {
			assert.isFalse( canUpdateFiles( {} ) );
		} );

		test( 'Should return false when passed an object without options.', () => {
			assert.isFalse( canUpdateFiles( { hello: 'not important' } ) );
		} );

		test( 'Should return false when passed an site object that has something value in the file_mod_option.', () => {
			const site = {
				options: {
					unmapped_url: 'someurl',
					main_network_site: 'someurl',
					is_multi_network: false,
					file_mod_disabled: [ 'something else' ],
				},
			};
			assert.isFalse( canUpdateFiles( site ) );
		} );

		test( 'Should return false when passed a multi site when unmapped_url and main_network_site are not equal.', () => {
			const site = {
				is_multisite: true,
				options: {
					unmapped_url: 'someurl',
					main_network_site: 'someurl-different',
					is_multi_network: false,
					file_mod_disabled: false,
				},
			};
			assert.isFalse( canUpdateFiles( site ) );
		} );

		test( 'Should return true when passed a site a single site even though the unmapped_url is not the same as main_network_site.', () => {
			const site = {
				is_multisite: false,
				options: {
					unmapped_url: 'someurl',
					main_network_site: 'someurl-different',
					is_multi_network: false,
					file_mod_disabled: false,
				},
			};
			assert.isTrue( canUpdateFiles( site ) );
		} );

		test( 'Should return true when passed a site that has different protocolls for unmapped_url and main_network_site.', () => {
			const site = {
				is_multisite: true,
				options: {
					unmapped_url: 'http://someurl',
					main_network_site: 'https://someurl',
					is_multi_network: false,
					file_mod_disabled: false,
				},
			};
			assert.isTrue( canUpdateFiles( site ) );
		} );

		test( 'Should return false when passed a site  that has compares ftp to http protocolls for unmapped_url and main_network_site.', () => {
			const site = {
				is_multisite: true,
				options: {
					unmapped_url: 'http://someurl',
					main_network_site: 'ftp://someurl',
					is_multi_network: false,
					file_mod_disabled: false,
				},
			};
			assert.isFalse( canUpdateFiles( site ) );
		} );

		test( 'Should return true when passed a site that has all the right settings permissions to be able to update files.', () => {
			const site = {
				is_multisite: true,
				options: {
					unmapped_url: 'someurl',
					main_network_site: 'someurl',
					is_multi_network: false,
					file_mod_disabled: false,
				},
			};
			assert.isTrue( canUpdateFiles( site ) );
		} );
	} );

	describe( 'isMainNetworkSite', () => {
		test( 'Should have a method isMainNetworkSite.', () => {
			assert.isFunction( isMainNetworkSite );
		} );

		test( 'Should return false when no site object is passed in.', () => {
			assert.isFalse( isMainNetworkSite() );
		} );

		test( 'Should return false when passed an empty object.', () => {
			assert.isFalse( isMainNetworkSite( {} ) );
		} );

		test( 'Should return false when passed an object without options.', () => {
			assert.isFalse( isMainNetworkSite( { hello: 'not important' } ) );
		} );

		test( 'Should return false when passed a multi site when unmapped_url and main_network_site are not equal.', () => {
			const site = {
				is_multisite: true,
				options: {
					unmapped_url: 'someurl',
					main_network_site: 'someurl-different',
				},
			};
			assert.isFalse( isMainNetworkSite( site ) );
		} );

		test( 'Should return true when passed a site a single site even though the unmapped_url is not the same as main_network_site.', () => {
			const site = {
				is_multisite: false,
				options: {
					unmapped_url: 'someurl',
					main_network_site: 'someurl-different',
				},
			};
			assert.isTrue( isMainNetworkSite( site ) );
		} );

		test( 'Should return false when passed a site that a part of a multi network.', () => {
			const site = {
				options: {
					is_multi_network: true,
				},
			};
			assert.isFalse( isMainNetworkSite( site ) );
		} );

		test( 'Should return true when passed a site that has different protocolls for unmapped_url and main_network_site.', () => {
			const site = {
				is_multisite: true,
				options: {
					unmapped_url: 'http://someurl',
					main_network_site: 'https://someurl',
				},
			};
			assert.isTrue( isMainNetworkSite( site ) );
		} );

		test( 'Should return false when passed a site that has compares ftp to http protocolls for unmapped_url and main_network_site.', () => {
			const site = {
				is_multisite: true,
				options: {
					unmapped_url: 'http://someurl',
					main_network_site: 'ftp://someurl',
				},
			};
			assert.isFalse( isMainNetworkSite( site ) );
		} );

		test( 'Does not explode when unmapped_url is not defined', () => {
			const site = {
				is_multisite: true,
				options: {},
			};
			assert.isFalse( isMainNetworkSite( site ) );
		} );
	} );
} );
