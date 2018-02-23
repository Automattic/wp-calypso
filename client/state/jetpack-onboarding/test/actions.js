/** @format */

/**
 * Internal dependencies
 */
import {
	receiveJetpackOnboardingCredentials,
	requestJetpackOnboardingSettings,
	saveJetpackOnboardingSettings,
	saveJetpackSettingsSuccess,
	updateJetpackSettings,
} from '../actions';
import {
	JETPACK_ONBOARDING_CREDENTIALS_RECEIVE,
	JETPACK_ONBOARDING_SETTINGS_REQUEST,
	JETPACK_SETTINGS_SAVE,
	JETPACK_SETTINGS_SAVE_SUCCESS,
	JETPACK_ONBOARDING_SETTINGS_UPDATE,
} from 'state/action-types';

describe( 'actions', () => {
	describe( 'receiveJetpackOnboardingCredentials()', () => {
		test( 'should return a jetpack onboarding credentials receive action object', () => {
			const credentials = {
				token: 'abcd1234',
				siteUrl: 'http://yourgroovydomain.com/',
				userEmail: 'somebody@yourgroovydomain.com',
			};
			const siteId = 12345678;
			const action = receiveJetpackOnboardingCredentials( siteId, credentials );

			expect( action ).toEqual( {
				type: JETPACK_ONBOARDING_CREDENTIALS_RECEIVE,
				siteId,
				credentials,
			} );
		} );
	} );

	describe( 'requestJetpackOnboardingSettings()', () => {
		test( 'should return a jetpack onboarding settings request action object', () => {
			const siteId = 12345678;
			const action = requestJetpackOnboardingSettings( siteId );

			expect( action ).toEqual( {
				type: JETPACK_ONBOARDING_SETTINGS_REQUEST,
				siteId,
				meta: {
					dataLayer: {
						trackRequest: true,
					},
				},
			} );
		} );
	} );

	describe( 'saveJetpackOnboardingSettings()', () => {
		test( 'should return a jetpack onboarding settings save action object', () => {
			const settings = {
				siteTitle: 'My awesome site title',
				siteDescription: 'Not just another WordPress site',
			};
			const siteId = 12345678;
			const action = saveJetpackOnboardingSettings( siteId, settings );

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
		test( 'should return a jetpack onboarding settings save action success object', () => {
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
		test( 'should return a jetpack onboarding settings update action object', () => {
			const settings = {
				siteTitle: 'My awesome site title',
				siteDescription: 'Not just another WordPress site',
			};
			const siteId = 12345678;
			const action = updateJetpackSettings( siteId, settings );

			expect( action ).toEqual( {
				type: JETPACK_ONBOARDING_SETTINGS_UPDATE,
				siteId,
				settings,
			} );
		} );
	} );
} );
