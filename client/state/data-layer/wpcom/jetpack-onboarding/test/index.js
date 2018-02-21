/** @format */

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	MAX_WOOCOMMERCE_INSTALL_RETRIES,
	requestJetpackOnboardingSettings,
	saveJetpackOnboardingSettings,
	handleSaveSuccess,
	announceRequestFailure,
	announceSaveFailure,
	retryOrAnnounceSaveFailure,
	fromApi,
} from '../';
import {
	JETPACK_ONBOARDING_SETTINGS_SAVE,
	JETPACK_ONBOARDING_SETTINGS_UPDATE,
} from 'state/action-types';
import {
	saveJetpackOnboardingSettingsSuccess,
	updateJetpackOnboardingSettings,
} from 'state/jetpack-onboarding/actions';

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

describe( 'announceRequestFailure()', () => {
	const dispatch = jest.fn();
	const siteId = 12345678;
	const siteUrl = 'http://yourgroovydomain.com';

	test( 'should trigger an error notice with an action button when request fails', () => {
		const getState = () => ( {
			jetpackOnboarding: {
				credentials: {
					[ siteId ]: {
						siteUrl,
						token: 'abcd1234',
						userEmail: 'example@yourgroovydomain.com',
					},
				},
			},
		} );

		announceRequestFailure( { dispatch, getState }, { siteId } );

		expect( dispatch ).toHaveBeenCalledWith(
			expect.objectContaining( {
				notice: expect.objectContaining( {
					button: 'Visit site admin',
					href: siteUrl + '/wp-admin/admin.php?page=jetpack',
					noticeId: `jpo-communication-error-${ siteId }`,
					status: 'is-error',
					text: 'Something went wrong.',
				} ),
			} )
		);
	} );

	test( 'should trigger an error notice without action button if url is missing', () => {
		const getState = () => ( {
			jetpackOnboarding: {
				credentials: {
					[ siteId ]: {
						token: 'abcd1234',
						userEmail: 'example@yourgroovydomain.com',
					},
				},
			},
		} );

		announceRequestFailure( { dispatch, getState }, { siteId } );

		expect( dispatch ).toHaveBeenCalledWith(
			expect.objectContaining( {
				notice: expect.objectContaining( {
					noticeId: `jpo-communication-error-${ siteId }`,
					status: 'is-error',
					text: 'Something went wrong.',
				} ),
			} )
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
		expect( dispatch ).toHaveBeenCalledWith( updateJetpackOnboardingSettings( siteId, settings ) );
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

describe( 'handleSaveSuccess()', () => {
	const dispatch = jest.fn();
	const siteId = 12345678;
	const settings = {
		siteTitle: 'My Awesome Site',
		siteDescription: 'Not just another WordPress Site',
	};

	test( 'should dispatch a save success action upon successful save request', () => {
		handleSaveSuccess( { dispatch }, { siteId, settings } );

		expect( dispatch ).toHaveBeenCalledWith(
			expect.objectContaining( saveJetpackOnboardingSettingsSuccess( siteId, settings ) )
		);
	} );
} );

describe( 'announceSaveFailure()', () => {
	const dispatch = jest.fn();
	const siteId = 12345678;

	test( 'should trigger an error notice upon unsuccessful save request', () => {
		announceSaveFailure( { dispatch }, { siteId } );

		expect( dispatch ).toHaveBeenCalledWith(
			expect.objectContaining( {
				notice: expect.objectContaining( {
					status: 'is-error',
					text: 'An unexpected error occurred. Please try again later.',
					noticeId: `jpo-notice-error-${ siteId }`,
					duration: 5000,
				} ),
			} )
		);
	} );
} );

describe( 'retryOrAnnounceSaveFailure()', () => {
	const dispatch = jest.fn();
	const siteId = 12345678;
	const settings = {
		installWooCommerce: true,
	};
	const action = {
		type: JETPACK_ONBOARDING_SETTINGS_SAVE,
		siteId,
		settings,
		meta: {
			dataLayer: {
				trackRequest: true,
			},
		},
	};
	const error = {
		error: 'http_request_failed',
		message: 'cURL error 28: Operation timed out after 5001 milliseconds with 0 bytes received',
	};

	test( 'should trigger saveJetpackOnboardingSettings upon first WooCommerce install timeout', () => {
		retryOrAnnounceSaveFailure( { dispatch }, action, error );

		expect( dispatch ).toHaveBeenCalledWith(
			expect.objectContaining( {
				settings,
				siteId,
				type: JETPACK_ONBOARDING_SETTINGS_SAVE,
				meta: {
					dataLayer: {
						retryCount: 1,
						trackRequest: true,
					},
				},
			} )
		);
	} );

	test( 'should trigger announceSaveFailure upon max number of WooCommerce install timeout', () => {
		const thirdAttemptAction = {
			...action,
			meta: {
				...action.meta,
				dataLayer: {
					...action.meta.dataLayer,
					retryCount: MAX_WOOCOMMERCE_INSTALL_RETRIES + 1,
				},
			},
		};

		retryOrAnnounceSaveFailure( { dispatch }, thirdAttemptAction, error );

		expect( dispatch ).toHaveBeenCalledWith(
			expect.objectContaining( {
				notice: expect.objectContaining( {
					status: 'is-error',
					text: 'An unexpected error occurred. Please try again later.',
					noticeId: `jpo-notice-error-${ siteId }`,
					duration: 5000,
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
