/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	MAX_WOOCOMMERCE_INSTALL_RETRIES,
	requestJetpackSettings,
	saveJetpackSettings,
	handleSaveSuccess,
	announceRequestFailure,
	handleSaveFailure,
	retryOrAnnounceSaveFailure,
	fromApi,
} from '../';
import { JETPACK_SETTINGS_SAVE, JETPACK_SETTINGS_UPDATE } from 'calypso/state/action-types';
import { normalizeSettings } from 'calypso/state/jetpack/settings/utils';
import {
	saveJetpackSettingsSuccess,
	updateJetpackSettings,
} from 'calypso/state/jetpack/settings/actions';

describe( 'requestJetpackSettings()', () => {
	const token = 'abcd1234';
	const userEmail = 'example@yourgroovydomain.com';
	const siteId = 12345678;

	const action = {
		type: JETPACK_SETTINGS_UPDATE,
		siteId,
	};

	test( 'should dispatch an action for a GET HTTP request to fetch Jetpack settings', () => {
		const result = requestJetpackSettings( action );

		expect( result ).toEqual(
			http(
				{
					apiVersion: '1.1',
					method: 'GET',
					path: '/jetpack-blogs/' + siteId + '/rest-api/',
					query: {
						path: '/jetpack/v4/settings/',
						query: undefined,
						json: true,
					},
				},
				action
			)
		);
	} );

	test( 'should dispatch an action for GET HTTP request with a query including onboarding credentials', () => {
		const query = {
			onboarding: {
				token,
				jpUser: userEmail,
			},
		};
		const actionWithAuth = { ...action, query };

		const result = requestJetpackSettings( actionWithAuth );

		expect( result ).toEqual(
			http(
				{
					apiVersion: '1.1',
					method: 'GET',
					path: '/jetpack-blogs/' + siteId + '/rest-api/',
					query: {
						path: '/jetpack/v4/settings/',
						query: JSON.stringify( query ),
						json: true,
					},
				},
				actionWithAuth
			)
		);
	} );
} );

describe( 'announceRequestFailure()', () => {
	const dispatch = jest.fn();
	const siteId = 12345678;
	const siteUrl = 'http://yourgroovydomain.com';

	test( 'should trigger an error notice with an action button when request fails for a connected site', () => {
		const getState = () => ( {
			jetpack: {
				onboarding: {
					credentials: {},
				},
			},
			sites: {
				items: {
					[ siteId ]: {
						ID: siteId,
						URL: siteUrl,
					},
				},
			},
		} );

		announceRequestFailure( { siteId } )( dispatch, getState );

		expect( dispatch ).toHaveBeenCalledWith(
			expect.objectContaining( {
				notice: expect.objectContaining( {
					button: 'Visit site admin',
					href: siteUrl + '/wp-admin/admin.php?page=jetpack',
					noticeId: `jps-communication-error-${ siteId }`,
					status: 'is-error',
					text: 'Something went wrong.',
				} ),
			} )
		);
	} );

	test( 'should trigger an error notice without action button if url is missing', () => {
		const getState = () => ( {
			jetpack: {
				onboarding: {
					credentials: {
						[ siteId ]: {
							token: 'abcd1234',
							userEmail: 'example@yourgroovydomain.com',
						},
					},
				},
			},
			sites: {
				items: {},
			},
		} );

		announceRequestFailure( { siteId } )( dispatch, getState );

		expect( dispatch ).toHaveBeenCalledWith(
			expect.objectContaining( {
				notice: expect.objectContaining( {
					noticeId: `jps-communication-error-${ siteId }`,
					status: 'is-error',
					text: 'Something went wrong.',
				} ),
			} )
		);
	} );
} );

describe( 'saveJetpackSettings()', () => {
	const dispatch = jest.fn();
	const token = 'abcd1234';
	const userEmail = 'example@yourgroovydomain.com';
	const siteId = 12345678;
	const onboardingSettings = {
		siteTitle: 'My Awesome Site',
		siteDescription: 'Not just another WordPress Site',
	};
	const settings = {
		onboarding: {
			...onboardingSettings,
			token,
			jpUser: userEmail,
		},
	};

	const previousSettings = {
		onboarding: {
			siteTitle: '',
			siteDescription: 'Just another WordPress site',
		},
	};

	const getState = () => ( {
		jetpack: { settings: { [ 12345678 ]: previousSettings } },
	} );

	const action = {
		type: JETPACK_SETTINGS_SAVE,
		siteId,
		settings,
	};

	test( 'should dispatch an action for POST HTTP request to save Jetpack settings, omitting legacy Jetpack Onboarding credentials', () => {
		saveJetpackSettings( action )( dispatch, getState );

		expect( dispatch ).toHaveBeenCalledWith(
			http(
				{
					apiVersion: '1.1',
					method: 'POST',
					path: '/jetpack-blogs/' + siteId + '/rest-api/',
					body: {
						path: '/jetpack/v4/settings/',
						body: JSON.stringify( settings ),
						json: true,
					},
				},
				{ ...action, meta: { ...action.meta, settings: previousSettings } }
			)
		);
		expect( dispatch ).toHaveBeenCalledWith(
			updateJetpackSettings( siteId, { onboarding: onboardingSettings } )
		);
	} );
} );

describe( 'handleSaveSuccess()', () => {
	const siteId = 12345678;
	const settings = {
		siteTitle: 'My Awesome Site',
		siteDescription: 'Not just another WordPress Site',
	};

	test( 'should dispatch a save success action upon successful save request', () => {
		const result = handleSaveSuccess( { siteId }, { data: settings } );

		expect( result ).toEqual(
			expect.objectContaining( saveJetpackSettingsSuccess( siteId, settings ) )
		);
	} );
} );

describe( 'handleSaveFailure()', () => {
	const siteId = 12345678;
	const action = {
		type: JETPACK_SETTINGS_SAVE,
		siteId,
		settings: {
			siteTitle: 'My Awesome Site',
			siteDescription: 'Not just another WordPress Site',
		},
		meta: {
			settings: {
				siteTitle: '',
				siteDescription: 'Just another WordPress site',
			},
		},
	};

	test( 'should trigger an error notice upon unsuccessful save request', () => {
		const result = handleSaveFailure( { siteId }, action );

		expect( result[ 1 ] ).toMatchObject( {
			notice: {
				status: 'is-error',
				text: 'An unexpected error occurred. Please try again later.',
				noticeId: `jps-notice-error-${ siteId }`,
				duration: 5000,
			},
		} );
	} );
} );

describe( 'retryOrAnnounceSaveFailure()', () => {
	const siteId = 12345678;
	const settings = {
		onboarding: {
			installWooCommerce: true,
		},
	};
	const action = {
		type: JETPACK_SETTINGS_SAVE,
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

	test( 'should trigger saveJetpackSettings upon first WooCommerce install timeout', () => {
		const result = retryOrAnnounceSaveFailure( action, error );

		expect( result ).toEqual(
			expect.objectContaining( {
				settings,
				siteId,
				type: JETPACK_SETTINGS_SAVE,
				meta: {
					dataLayer: {
						retryCount: 1,
						trackRequest: true,
					},
				},
			} )
		);
	} );

	test( 'should trigger handleSaveFailure upon max number of WooCommerce install timeout', () => {
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

		const result = retryOrAnnounceSaveFailure( thirdAttemptAction, error );

		expect( result[ 1 ] ).toMatchObject( {
			notice: {
				status: 'is-error',
				text: 'An unexpected error occurred. Please try again later.',
				noticeId: `jps-notice-error-${ siteId }`,
				duration: 5000,
			},
		} );
	} );
} );

describe( 'fromApi', () => {
	test( 'should throw an error if no data field is set', () => {
		const response = { noData: { onboarding: {} } };
		expect( () => fromApi( response ) ).toThrow( 'missing settings' );
	} );

	test( 'should return normalized data if present', () => {
		const settings = {
			jetpack_portfolio: true,
			onboarding: { siteTitle: 'Yet Another Site Title' },
		};
		expect( fromApi( { data: settings } ) ).toEqual( normalizeSettings( settings ) );
	} );
} );
