/*
 * These tests shouldn't require the jsdom environment,
 * but we're waiting for this PR to merge:
 * https://github.com/WordPress/gutenberg/pull/20486
 *
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { sites, launchStatus } from '../reducer';
import {
	SiteLaunchError,
	SiteLaunchState,
	SiteLaunchStatus,
	SiteDetails,
	SiteError,
} from '../types';
import { createActions } from '../actions';

describe( 'Site', () => {
	const siteDetailsResponse: SiteDetails = {
		ID: 12345,
		name: 'My test site',
		description: '',
		URL: 'http://mytestsite12345.wordpress.com',
	};

	const siteErrorResponse: SiteError = {
		error: 'unknown_blog',
		message: 'Unknown blog',
	};

	it( 'returns the correct default state', () => {
		const state = sites( undefined, { type: 'TEST_ACTION' } );
		expect( state ).toEqual( {} );
	} );

	it( 'returns site data keyed by id', () => {
		const state = sites( undefined, {
			type: 'RECEIVE_SITE',
			siteId: 12345,
			response: siteDetailsResponse,
		} );
		expect( state ).toEqual( {
			12345: siteDetailsResponse,
		} );
	} );

	it( 'clears data keyed by id, and no other data is affected', () => {
		const originalState = {
			12345: siteDetailsResponse,
			23456: siteDetailsResponse,
		};
		const updatedState = sites( originalState, {
			type: 'RECEIVE_SITE_FAILED',
			siteId: 23456,
			response: siteErrorResponse,
		} );

		expect( updatedState ).toEqual( {
			12345: siteDetailsResponse,
		} );
	} );

	describe( 'Launch Status', () => {
		type ClientCredentials = { client_id: string; client_secret: string };

		let siteId: number;
		let client_id: string;
		let client_secret: string;
		let mockedClientCredentials: ClientCredentials;
		let originalState: { [ key: number ]: SiteLaunchState };

		beforeEach( () => {
			siteId = 12345;
			client_id = 'magic_client_id';
			client_secret = 'magic_client_secret';
			mockedClientCredentials = { client_id, client_secret };
			originalState = {
				[ siteId ]: { status: SiteLaunchStatus.UNINITIALIZED, errorCode: undefined },
			};
		} );

		it( 'should default to the initial state when an unknown action is dispatched', () => {
			const state = launchStatus( undefined, { type: 'TEST_ACTION' } );
			expect( state ).toStrictEqual( {} );
		} );

		it( 'should set the status to SiteLaunchStatus.IN_PROGRESS when a LAUNCH_SITE_START action is dispatched', () => {
			const { launchSiteStart } = createActions( mockedClientCredentials );

			const action = launchSiteStart( siteId );
			const expected = {
				...originalState,
				[ siteId ]: { ...originalState[ siteId ], status: SiteLaunchStatus.IN_PROGRESS },
			};

			expect( launchStatus( originalState, action ) ).toEqual( expected );
		} );

		it( 'should set the status to SiteLaunchStatus.SUCCESS when a LAUNCH_SITE_SUCCESS action is dispatched', () => {
			const { launchSiteSuccess } = createActions( mockedClientCredentials );

			const action = launchSiteSuccess( siteId );
			const expected = {
				...originalState,
				[ siteId ]: { ...originalState[ siteId ], status: SiteLaunchStatus.SUCCESS },
			};

			expect( launchStatus( originalState, action ) ).toEqual( expected );
		} );

		it( 'should set the status to SiteLaunchStatus.FAILURE and set an errorCode when a LAUNCH_SITE_FAILURE action is dispatched', () => {
			const { launchSiteFailure } = createActions( mockedClientCredentials );
			const error = SiteLaunchError.INTERNAL;
			const action = launchSiteFailure( siteId, error );
			const expected = {
				...originalState,
				[ siteId ]: {
					...originalState[ siteId ],
					status: SiteLaunchStatus.FAILURE,
					errorCode: SiteLaunchError.INTERNAL,
				},
			};

			expect( launchStatus( originalState, action ) ).toEqual( expected );
		} );
	} );
} );
