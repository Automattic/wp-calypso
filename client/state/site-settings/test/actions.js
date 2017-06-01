/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	SITE_SETTINGS_RECEIVE,
	SITE_SETTINGS_REQUEST,
	SITE_SETTINGS_SAVE,
	SITE_SETTINGS_UPDATE
} from 'state/action-types';
import {
	receiveSiteSettings,
	requestSiteSettings,
	saveSiteSettings,
	updateSiteSettings
} from '../actions';

describe( 'actions', () => {

	describe( 'receiveSiteSettings()', () => {
		it( 'should return an action object', () => {
			const settings = { settingKey: 'cat' };
			const action = receiveSiteSettings( 2916284, settings );

			expect( action ).to.eql( {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings
			} );
		} );
	} );

	describe( 'updateSiteSettings()', () => {
		it( 'should return an action object', () => {
			const settings = { settingKey: 'cat' };
			const action = updateSiteSettings( 2916284, settings );

			expect( action ).to.eql( {
				type: SITE_SETTINGS_UPDATE,
				siteId: 2916284,
				settings
			} );
		} );
	} );

	describe( 'requestSiteSettings()', () => {
		it( 'should return an action object', () => {
			const action = requestSiteSettings( 2916284 );

			expect( action ).to.eql( {
				type: SITE_SETTINGS_REQUEST,
				siteId: 2916284
			} );
		} );
	} );

	describe( 'saveSiteSettings()', () => {
		it( 'should return an action object', () => {
			const action = saveSiteSettings( 2916284, { settingKey: 'chicken' } );

			expect( action ).to.eql( {
				type: SITE_SETTINGS_SAVE,
				siteId: 2916284,
				settings: { settingKey: 'chicken' }
			} );
		} );
	} );
} );
