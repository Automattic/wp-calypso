/** @format */

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { saveJetpackOnboardingSettings, announceSaveFailure } from '../';
import { JETPACK_ONBOARDING_SETTINGS_SAVE } from 'state/action-types';

describe( 'saveJetpackOnboardingSettings()', () => {
	const dispatch = jest.fn();
	const token = 'abcd1234';
	const userEmail = 'example@yourgroovydomain.com';
	const siteId = 12345678;
	const settings = {
		siteTitle: 'My Awesome Site',
		siteDescription: 'Not just another WordPress Site',
	};
	const action = {
		type: JETPACK_ONBOARDING_SETTINGS_SAVE,
		siteId,
		settings,
	};

	test( 'should dispatch an action for POST HTTP request to save Jetpack Onboarding settings', () => {
		const getState = () => ( {
			jetpackOnboarding: {
				credentials: {
					[ siteId ]: {
						token,
						userEmail,
					},
				},
			},
		} );

		saveJetpackOnboardingSettings( { dispatch, getState }, action );

		expect( dispatch ).toHaveBeenCalledWith(
			http(
				{
					apiVersion: '1.1',
					method: 'POST',
					path: '/jetpack-blogs/' + siteId + '/rest-api/',
					body: {
						path: '/jetpack/v4/settings/',
						body: JSON.stringify( {
							onboarding: {
								...settings,
								token,
								jpUser: userEmail,
							},
						} ),
						json: true,
					},
				},
				action
			)
		);
	} );

	test( 'should pass null token and user email in save request when site credentials are unknown', () => {
		const getState = () => ( {
			jetpackOnboarding: {
				credentials: {},
			},
		} );

		saveJetpackOnboardingSettings( { dispatch, getState }, action );

		expect( dispatch ).toHaveBeenCalledWith(
			http(
				{
					apiVersion: '1.1',
					method: 'POST',
					path: '/jetpack-blogs/' + siteId + '/rest-api/',
					body: {
						path: '/jetpack/v4/settings/',
						body: JSON.stringify( {
							onboarding: {
								...settings,
								token: null,
								jpUser: null,
							},
						} ),
						json: true,
					},
				},
				action
			)
		);
	} );
} );

describe( 'announceSaveFailure()', () => {
	const dispatch = jest.fn();

	test( 'should trigger an error notice upon unsuccessful save request', () => {
		announceSaveFailure( { dispatch } );

		expect( dispatch ).toHaveBeenCalledWith(
			expect.objectContaining( {
				notice: expect.objectContaining( {
					status: 'is-error',
					text: 'An unexpected error occurred. Please try again later.',
				} ),
			} )
		);
	} );
} );
