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

		it( 'CanUpdateFiles should return false when no site object is passed in.', function() {
			assert.isFalse( SiteUtils.canUpdateFiles() );
		} );

		it( 'CanUpdateFiles should return false when passed an empty object.', function() {
			assert.isFalse( SiteUtils.canUpdateFiles( {} ) );
		} );

		it( 'CanUpdateFiles should return false when passed an object without options.', function() {
			assert.isFalse( SiteUtils.canUpdateFiles( { hello: 'not important' } ) );
		} );

		it( 'CanUpdateFiles should return false when passed an site object that has something value in the file_mod_option.', function() {
			const site = {
				hasMinimumJetpackVersion: true,
				options: {
					unmapped_url: 'someurl',
					main_network_site: 'someurl',
					is_multi_network: false,
					file_mod_disabled: [ 'something else' ]
				}
			}
			assert.isFalse( SiteUtils.canUpdateFiles( site ) );
		} );

		it( 'CanUpdateFiles should return true when passed a site data has all the right settings permissions to be able to update files.', function() {
			const site = {
				hasMinimumJetpackVersion: true,
				options: {
					unmapped_url: 'someurl',
					main_network_site: 'someurl',
					is_multi_network: false,
					file_mod_disabled: false
				}
			}
			assert.isTrue( SiteUtils.canUpdateFiles( site ) );
		} );
	} );
} );
