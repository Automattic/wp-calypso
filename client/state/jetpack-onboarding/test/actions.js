/** @format */

/**
 * Internal dependencies
 */
import { receiveJetpackOnboardingCredentials, saveJetpackOnboardingSettings } from '../actions';
import {
	JETPACK_ONBOARDING_CREDENTIALS_RECEIVE,
	JETPACK_ONBOARDING_SETTINGS_SAVE,
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

	describe( 'saveJetpackOnboardingSettings()', () => {
		test( 'should return a jetpack onboarding settings save action object', () => {
			const settings = {
				siteTitle: 'My awesome site title',
				siteDescription: 'Not just another WordPress site',
			};
			const siteId = 12345678;
			const action = saveJetpackOnboardingSettings( siteId, settings );

			expect( action ).toEqual( {
				type: JETPACK_ONBOARDING_SETTINGS_SAVE,
				siteId,
				settings,
			} );
		} );
	} );
} );
