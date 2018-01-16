/** @format */

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	requestJetpackOnboardingSettings,
	saveJetpackOnboardingSettings,
	storeJetpackOnboardingSettings,
	announceSaveFailure,
	fromApi,
} from '../';
import {
	JETPACK_ONBOARDING_SETTINGS_SAVE,
	JETPACK_ONBOARDING_SETTINGS_UPDATE,
} from 'state/action-types';
import { updateJetpackOnboardingSettings } from 'state/jetpack-onboarding/actions';

describe( 'requestJetpackOnboardingSettings()', () => {
	const dispatch = jest.fn();
	const token = 'abcd1234';
	const userEmail = 'example@yourgroovydomain.com';
	const siteId = 12345678;

	const action = {
		type: JETPACK_ONBOARDING_SETTINGS_UPDATE,
		siteId,
	};

	test( 'should dispatch an action for GET HTTP request to save Jetpack Onboarding settings', () => {
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

		requestJetpackOnboardingSettings( { dispatch, getState }, action );

		expect( dispatch ).toHaveBeenCalledWith(
			http(
				{
					apiVersion: '1.1',
					method: 'GET',
					path: '/jetpack-blogs/' + siteId + '/rest-api/',
					query: {
						path: '/jetpack/v4/settings/',
						query: JSON.stringify( {
							onboarding: {
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

		requestJetpackOnboardingSettings( { dispatch, getState }, action );

		expect( dispatch ).toHaveBeenCalledWith(
			http(
				{
					apiVersion: '1.1',
					method: 'GET',
					path: '/jetpack-blogs/' + siteId + '/rest-api/',
					query: {
						path: '/jetpack/v4/settings/',
						query: JSON.stringify( {
							onboarding: {
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
} );

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

describe( 'storeJetpackOnboardingSettings()', () => {
	test( 'should dispatch action that updates Redux state upon successful save request', () => {
		const dispatch = jest.fn();
		const siteId = 12345678;
		const settings = {
			siteTitle: 'My Awesome Site',
			siteDescription: 'Not just another WordPress Site',
		};

		storeJetpackOnboardingSettings( { dispatch }, { siteId, settings } );

		expect( dispatch ).toHaveBeenCalledWith( updateJetpackOnboardingSettings( siteId, settings ) );
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

describe( 'fromApi', () => {
	test( 'should throw an error if no data field is set', () => {
		const response = { noData: { onboarding: {} } };
		expect( () => fromApi( response ) ).toThrow( 'missing onboarding settings' );
	} );

	test( 'should throw an error if no onboarding settings are given', () => {
		const response = { data: { noOnboarding: {} } };
		expect( () => fromApi( response ) ).toThrow( 'missing onboarding settings' );
	} );

	test( 'should return onboarding settings object if present', () => {
		const response = { data: { onboarding: { siteTitle: 'Yet Another Site Title' } } };
		expect( fromApi( response ) ).toEqual( { siteTitle: 'Yet Another Site Title' } );
	} );
} );
