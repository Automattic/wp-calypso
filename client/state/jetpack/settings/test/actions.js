/**
 * Internal dependencies
 */
import {
	regeneratePostByEmail,
	requestJetpackSettings,
	saveJetpackSettings,
	saveJetpackSettingsSuccess,
	updateJetpackSettings,
} from '../actions';
import {
	JETPACK_SETTINGS_REQUEST,
	JETPACK_SETTINGS_SAVE,
	JETPACK_SETTINGS_SAVE_SUCCESS,
	JETPACK_SETTINGS_UPDATE,
} from 'calypso/state/action-types';

describe( 'actions', () => {
	describe( 'requestJetpackSettings()', () => {
		test( 'should return a jetpack settings request action object', () => {
			const siteId = 12345678;
			const action = requestJetpackSettings( siteId );

			expect( action ).toEqual( {
				type: JETPACK_SETTINGS_REQUEST,
				siteId,
				meta: {
					dataLayer: {
						trackRequest: true,
					},
				},
			} );
		} );
	} );

	describe( 'saveJetpackSettings()', () => {
		test( 'should return a jetpack settings save action object', () => {
			const settings = {
				siteTitle: 'My awesome site title',
				siteDescription: 'Not just another WordPress site',
			};
			const siteId = 12345678;
			const action = saveJetpackSettings( siteId, settings );

			expect( action ).toEqual( {
				type: JETPACK_SETTINGS_SAVE,
				siteId,
				settings,
				meta: {
					dataLayer: {
						trackRequest: true,
					},
				},
			} );
		} );
	} );

	describe( 'saveJetpackSettingsSuccess()', () => {
		test( 'should return a settings save action success object', () => {
			const settings = {
				siteTitle: 'My awesome site title',
				siteDescription: 'Not just another WordPress site',
			};
			const siteId = 12345678;
			const action = saveJetpackSettingsSuccess( siteId, settings );

			expect( action ).toEqual( {
				type: JETPACK_SETTINGS_SAVE_SUCCESS,
				siteId,
				settings,
			} );
		} );
	} );

	describe( 'updateJetpackSettings()', () => {
		test( 'should return a jetpack settings update action object', () => {
			const settings = {
				siteTitle: 'My awesome site title',
				siteDescription: 'Not just another WordPress site',
			};
			const siteId = 12345678;
			const action = updateJetpackSettings( siteId, settings );

			expect( action ).toEqual( {
				type: JETPACK_SETTINGS_UPDATE,
				siteId,
				settings,
			} );
		} );
	} );

	describe( 'regeneratePostByEmail()', () => {
		test( 'should return a jetpack settings update action object with settings set to regenerate post-by-email', () => {
			const siteId = 12345678;
			const action = regeneratePostByEmail( siteId );

			expect( action ).toEqual(
				saveJetpackSettings( siteId, { post_by_email_address: 'regenerate' } )
			);
		} );
	} );
} );
