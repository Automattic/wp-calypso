/**
 * External dependencies
 */
import chai from 'chai';

/**
 * Internal dependencies
 */
import SiteUtils from 'lib/site/utils';

const assert = chai.assert;

describe( 'Site Utils', function() {
	describe( 'canUpdateFiles', function() {
		it( 'Should have a method canUpdateFiles.', function() {
			assert.isFunction( SiteUtils.canUpdateFiles );
		} );

		it( 'Should return false when no site object is passed in.', function() {
			assert.isFalse( SiteUtils.canUpdateFiles() );
		} );

		it( 'Should return false when passed an empty object.', function() {
			assert.isFalse( SiteUtils.canUpdateFiles( {} ) );
		} );

		it( 'Should return false when passed an object without options.', function() {
			assert.isFalse( SiteUtils.canUpdateFiles( { hello: 'not important' } ) );
		} );

		it( 'Should return false when passed an site object that has something value in the file_mod_option.', function() {
			const site = {
				hasMinimumJetpackVersion: true,
				options: {
					unmapped_url: 'someurl',
					main_network_site: 'someurl',
					is_multi_network: false,
					file_mod_disabled: [ 'something else' ]
				}
			};
			assert.isFalse( SiteUtils.canUpdateFiles( site ) );
		} );

		it( 'Should return false when passed a multi site when unmapped_url and main_network_site are not equal.', function() {
			const site = {
				hasMinimumJetpackVersion: true,
				is_multisite: true,
				options: {
					unmapped_url: 'someurl',
					main_network_site: 'someurl-different',
					is_multi_network: false,
					file_mod_disabled: false
				}
			};
			assert.isFalse( SiteUtils.canUpdateFiles( site ) );
		} );

		it( 'Should return true when passed a site a single site even though the unmapped_url is not the same as main_network_site.', function() {
			const site = {
				hasMinimumJetpackVersion: true,
				is_multisite: false,
				options: {
					unmapped_url: 'someurl',
					main_network_site: 'someurl-different',
					is_multi_network: false,
					file_mod_disabled: false
				}
			};
			assert.isTrue( SiteUtils.canUpdateFiles( site ) );
		} );

		it( 'Should return true when passed a site that has different protocolls for unmapped_url and main_network_site.', function() {
			const site = {
				hasMinimumJetpackVersion: true,
				is_multisite: true,
				options: {
					unmapped_url: 'http://someurl',
					main_network_site: 'https://someurl',
					is_multi_network: false,
					file_mod_disabled: false
				}
			};
			assert.isTrue( SiteUtils.canUpdateFiles( site ) );
		} );

		it( 'Should return false when passed a site  that has compares ftp to http protocolls for unmapped_url and main_network_site.', function() {
			const site = {
				hasMinimumJetpackVersion: true,
				is_multisite: true,
				options: {
					unmapped_url: 'http://someurl',
					main_network_site: 'ftp://someurl',
					is_multi_network: false,
					file_mod_disabled: false
				}
			};
			assert.isFalse( SiteUtils.canUpdateFiles( site ) );
		} );

		it( 'Should return true when passed a site that has all the right settings permissions to be able to update files.', function() {
			const site = {
				hasMinimumJetpackVersion: true,
				is_multisite: true,
				options: {
					unmapped_url: 'someurl',
					main_network_site: 'someurl',
					is_multi_network: false,
					file_mod_disabled: false
				}
			};
			assert.isTrue( SiteUtils.canUpdateFiles( site ) );
		} );
	} );

	describe( 'isMainNetworkSite', function() {
		it( 'Should have a method isMainNetworkSite.', function() {
			assert.isFunction( SiteUtils.isMainNetworkSite );
		} );

		it( 'Should return false when no site object is passed in.', function() {
			assert.isFalse( SiteUtils.isMainNetworkSite() );
		} );

		it( 'Should return false when passed an empty object.', function() {
			assert.isFalse( SiteUtils.isMainNetworkSite( {} ) );
		} );

		it( 'Should return false when passed an object without options.', function() {
			assert.isFalse( SiteUtils.isMainNetworkSite( { hello: 'not important' } ) );
		} );

		it( 'Should return false when passed a multi site when unmapped_url and main_network_site are not equal.', function() {
			const site = {
				is_multisite: true,
				options: {
					unmapped_url: 'someurl',
					main_network_site: 'someurl-different',
				}
			};
			assert.isFalse( SiteUtils.isMainNetworkSite( site ) );
		} );

		it( 'Should return true when passed a site a single site even though the unmapped_url is not the same as main_network_site.', function() {
			const site = {
				is_multisite: false,
				options: {
					unmapped_url: 'someurl',
					main_network_site: 'someurl-different',
				}
			};
			assert.isTrue( SiteUtils.isMainNetworkSite( site ) );
		} );

		it( 'Should return false when passed a site that a part of a multi network.', function() {
			const site = {
				options: {
					is_multi_network: true,
				}
			};
			assert.isFalse( SiteUtils.isMainNetworkSite( site ) );
		} );

		it( 'Should return true when passed a site that has different protocolls for unmapped_url and main_network_site.', function() {
			const site = {
				is_multisite: true,
				options: {
					unmapped_url: 'http://someurl',
					main_network_site: 'https://someurl',
				}
			};
			assert.isTrue( SiteUtils.isMainNetworkSite( site ) );
		} );

		it( 'Should return false when passed a site that has compares ftp to http protocolls for unmapped_url and main_network_site.', function() {
			const site = {
				is_multisite: true,
				options: {
					unmapped_url: 'http://someurl',
					main_network_site: 'ftp://someurl',
				}
			};
			assert.isFalse( SiteUtils.isMainNetworkSite( site ) );
		} );

		it( 'Does not explode when unmapped_url is not defined', function() {
			const site = {
				is_multisite: true,
				options: {}
			};
			assert.isFalse( SiteUtils.isMainNetworkSite( site ) );
		} );
	} );
} );
