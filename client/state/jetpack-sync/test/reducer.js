import { without } from 'lodash';
import {
	JETPACK_SYNC_STATUS_REQUEST,
	JETPACK_SYNC_STATUS_SUCCESS,
	JETPACK_SYNC_STATUS_ERROR,
	JETPACK_SYNC_START_REQUEST,
	JETPACK_SYNC_START_SUCCESS,
	JETPACK_SYNC_START_ERROR,
} from 'calypso/state/action-types';
import reducer, { syncStatus, fullSyncRequest } from '../reducer';
import { getExpectedResponseKeys } from '../utils';

const successfulSyncStatusRequest = {
	type: JETPACK_SYNC_STATUS_SUCCESS,
	siteId: 1234567,
	data: {
		started: 1470085369,
		queue_finished: 1470085370,
		sent_started: 1470085392,
		finished: 1470087342,
		total: {
			constants: 1,
			functions: 1,
			options: 1,
			terms: 25,
			themes: 1,
			users: 1,
			posts: 402,
			comments: 28,
			updates: 1,
		},
		queue: {
			constants: 1,
			functions: 1,
			options: 1,
			terms: 25,
			themes: 1,
			users: 1,
			posts: 402,
			comments: 28,
			updates: 1,
		},
		sent: {
			constants: 1,
			functions: 1,
			options: 1,
			terms: 25,
			themes: 1,
			users: 1,
			posts: 193,
		},
		config: {
			constants: true,
			functions: true,
			options: true,
			terms: true,
			themes: true,
			users: true,
			posts: true,
			comments: true,
			updates: true,
		},
		queue_size: 0,
		queue_lag: 0,
		full_queue_size: 239,
		full_queue_lag: 957.49082708359,
		is_scheduled: false,
	},
};

const inProgressSyncStatusRequest = {
	type: JETPACK_SYNC_STATUS_SUCCESS,
	siteId: 1234567,
	data: {
		started: 1470069379,
		queue_finished: 1470069380,
		sent_started: 1470069405,
		total: {
			constants: 1,
			functions: 1,
			options: 1,
			terms: 25,
			themes: 1,
			users: 1,
			posts: 402,
			comments: 28,
			updates: 1,
		},
		queue: {
			constants: 1,
			functions: 1,
			options: 1,
			terms: 25,
			themes: 1,
			users: 1,
			posts: 402,
			comments: 28,
			updates: 1,
		},
		sent: {
			constants: 1,
			functions: 1,
			options: 1,
			terms: 2,
		},
		config: {
			constants: true,
			functions: true,
			options: true,
			terms: true,
			themes: true,
			users: true,
			posts: true,
			comments: true,
			updates: true,
		},
		queue_size: 0,
		queue_lag: 0,
		full_queue_size: 457,
		full_queue_lag: 33.257718086243,
		is_scheduled: false,
	},
};

const erroredSyncStatusRequest = {
	type: JETPACK_SYNC_STATUS_ERROR,
	siteId: 1234578,
	error: {
		statusCode: 400,
	},
};

const successfulFullSyncRequest = {
	type: JETPACK_SYNC_START_SUCCESS,
	siteId: 1234567,
	data: {
		scheduled: true,
	},
};

const erroredFullSyncRequest = {
	type: JETPACK_SYNC_START_ERROR,
	siteId: 1234578,
	error: {
		statusCode: 400,
	},
};

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [ 'syncStatus', 'fullSyncRequest' ] )
		);
	} );

	describe( '#syncStatus()', () => {
		test( 'should default to an empty object', () => {
			const state = syncStatus( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should add a property with key matching site ID', () => {
			const state = syncStatus( undefined, { type: JETPACK_SYNC_STATUS_REQUEST, siteId: 123456 } );
			expect( state ).toHaveProperty( '123456' );
		} );

		test( 'should store more than one site as separate properties', () => {
			const state = syncStatus(
				syncStatus( undefined, successfulSyncStatusRequest ),
				erroredSyncStatusRequest
			);
			expect( Object.keys( state ) ).toEqual(
				expect.arrayContaining( [
					String( successfulSyncStatusRequest.siteId ),
					String( erroredSyncStatusRequest.siteId ),
				] )
			);
		} );

		test( 'should set isRequesting to true when fetching for a site', () => {
			const state = syncStatus( undefined, { type: JETPACK_SYNC_STATUS_REQUEST, siteId: 123456 } );
			expect( state ).toEqual( {
				123456: {
					isRequesting: true,
				},
			} );
		} );

		test( 'should set isRequesting to false when finished successfully fetching for a site', () => {
			const state = syncStatus( undefined, successfulSyncStatusRequest );
			expect( state ).toHaveProperty( String( successfulSyncStatusRequest.siteId ) );
			expect( state[ successfulSyncStatusRequest.siteId ] ).toHaveProperty( 'isRequesting', false );
		} );

		test( 'should set error to false when finished fetching for a site', () => {
			const state = syncStatus( undefined, successfulSyncStatusRequest );
			expect( state ).toHaveProperty( String( successfulSyncStatusRequest.siteId ) );
			expect( state[ successfulSyncStatusRequest.siteId ] ).toHaveProperty( 'error', false );
		} );

		test( 'should set lastSuccessfulStatus to current time when finished fetching for a site', () => {
			const startTime = Date.now();
			const state = syncStatus( undefined, inProgressSyncStatusRequest );
			expect( state ).toHaveProperty( String( inProgressSyncStatusRequest.siteId ) );
			expect( state[ inProgressSyncStatusRequest.siteId ] ).toHaveProperty(
				'lastSuccessfulStatus'
			);
			expect(
				state[ inProgressSyncStatusRequest.siteId ].lastSuccessfulStatus
			).toBeGreaterThanOrEqual( startTime );
		} );

		test( 'should set lastSuccessfulStatus to current time when finished without progress for a site', () => {
			let state = syncStatus( undefined, {} );
			const startTime = Date.now();
			state = syncStatus( state, successfulSyncStatusRequest );
			expect( state ).toHaveProperty( String( successfulSyncStatusRequest.siteId ) );
			expect( state[ successfulSyncStatusRequest.siteId ] ).toHaveProperty(
				'lastSuccessfulStatus'
			);
			expect(
				state[ successfulSyncStatusRequest.siteId ].lastSuccessfulStatus
			).toBeGreaterThanOrEqual( startTime );
		} );

		test( 'should store expected response keys on success', () => {
			const state = syncStatus( undefined, successfulSyncStatusRequest );
			expect( state ).toHaveProperty( String( successfulSyncStatusRequest.siteId ) );
			// legacy sync status will not have `progress` property.
			without(
				getExpectedResponseKeys().concat( [
					'error',
					'isRequesting',
					'lastSuccessfulStatus',
					'errorCounter',
				] ),
				'progress'
			).forEach( ( key ) => {
				expect( state[ successfulSyncStatusRequest.siteId ] ).toHaveProperty( key );
			} );
		} );

		test( 'should set errorCounter to 0 after a successful request', () => {
			const state = syncStatus( undefined, successfulSyncStatusRequest );
			expect( state ).toHaveProperty( String( successfulSyncStatusRequest.siteId ) );
			expect( state[ successfulSyncStatusRequest.siteId ] ).toHaveProperty( 'errorCounter', 0 );
		} );

		test( 'should set isRequesting to false when fetching for a site errors', () => {
			const state = syncStatus( undefined, erroredSyncStatusRequest );
			expect( state ).toHaveProperty( String( erroredSyncStatusRequest.siteId ) );
			expect( state[ erroredSyncStatusRequest.siteId ] ).toHaveProperty( 'isRequesting', false );
		} );

		test( 'should set error when fetching for a site errors', () => {
			const state = syncStatus( undefined, erroredSyncStatusRequest );
			expect( state ).toHaveProperty( String( erroredSyncStatusRequest.siteId ) );
			expect( state[ erroredSyncStatusRequest.siteId ] ).toHaveProperty(
				'error',
				erroredSyncStatusRequest.error
			);
		} );

		test( 'should set errorCounter to 1 when errorCounter previously undefined', () => {
			const state = syncStatus( undefined, erroredSyncStatusRequest );
			expect( state ).toHaveProperty( String( erroredSyncStatusRequest.siteId ) );
			expect( state[ erroredSyncStatusRequest.siteId ] ).toHaveProperty( 'errorCounter', 1 );
		} );

		test( 'should increment errorCounter when multiple errors occur', () => {
			const state = syncStatus(
				syncStatus( undefined, erroredSyncStatusRequest ),
				erroredSyncStatusRequest
			);

			expect( state ).toHaveProperty( String( erroredSyncStatusRequest.siteId ) );
			expect( state[ erroredSyncStatusRequest.siteId ] ).toHaveProperty( 'errorCounter', 2 );
		} );
	} );

	describe( '#fullSyncRequest()', () => {
		test( 'should default to an empty object', () => {
			const state = fullSyncRequest( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should add a property with key matching site ID', () => {
			const state = fullSyncRequest( undefined, {
				type: JETPACK_SYNC_START_REQUEST,
				siteId: 123456,
			} );
			expect( state ).toHaveProperty( '123456' );
		} );

		test( 'should set isRequesting to true when fetching for a site', () => {
			const siteId = 123456;
			const state = fullSyncRequest( undefined, { type: JETPACK_SYNC_START_REQUEST, siteId } );
			expect( state ).toHaveProperty( String( siteId ) );
			expect( state[ siteId ] ).toHaveProperty( 'isRequesting', true );
		} );

		test( 'should set lastRequest when fetching for a site', () => {
			const siteId = 123456;
			const startTime = Date.now();
			const state = fullSyncRequest( undefined, { type: JETPACK_SYNC_START_REQUEST, siteId } );
			expect( state ).toHaveProperty( String( siteId ) );
			expect( state[ siteId ] ).toHaveProperty( 'lastRequested' );
			expect( state[ siteId ].lastRequested ).toBeGreaterThanOrEqual( startTime );
		} );

		test( 'should store more than one site as separate properties', () => {
			const state = fullSyncRequest(
				fullSyncRequest( undefined, successfulFullSyncRequest ),
				erroredFullSyncRequest
			);
			expect( Object.keys( state ) ).toEqual(
				expect.arrayContaining( [
					String( successfulFullSyncRequest.siteId ),
					String( erroredFullSyncRequest.siteId ),
				] )
			);
		} );

		test( 'should set isRequesting to false after successfully scheduling sync', () => {
			const state = fullSyncRequest( undefined, successfulFullSyncRequest );
			expect( state ).toHaveProperty( String( successfulSyncStatusRequest.siteId ) );
			expect( state[ successfulSyncStatusRequest.siteId ] ).toHaveProperty( 'isRequesting', false );
		} );

		test( 'should set error to false after successfully scheduling sync', () => {
			const state = fullSyncRequest( undefined, successfulFullSyncRequest );
			expect( state ).toHaveProperty( String( successfulSyncStatusRequest.siteId ) );
			expect( state[ successfulSyncStatusRequest.siteId ] ).toHaveProperty( 'error', false );
		} );

		test( 'should set scheduled after successfully scheduling sync', () => {
			const state = fullSyncRequest( undefined, successfulFullSyncRequest );
			expect( state ).toHaveProperty( String( successfulSyncStatusRequest.siteId ) );
			expect( state[ successfulSyncStatusRequest.siteId ] ).toHaveProperty(
				'scheduled',
				successfulFullSyncRequest.data.scheduled
			);
		} );

		test( 'should set isRequesting to false after scheduling sync errors', () => {
			const state = fullSyncRequest( undefined, erroredFullSyncRequest );
			expect( state ).toHaveProperty( String( erroredSyncStatusRequest.siteId ) );
			expect( state[ erroredSyncStatusRequest.siteId ] ).toHaveProperty( 'isRequesting', false );
		} );

		test( 'should set scheduled to false after scheduling sync errors', () => {
			const state = fullSyncRequest( undefined, erroredFullSyncRequest );
			expect( state ).toHaveProperty( String( erroredSyncStatusRequest.siteId ) );
			expect( state[ erroredSyncStatusRequest.siteId ] ).toHaveProperty( 'scheduled', false );
		} );

		test( 'should set error after scheduling sync errors', () => {
			const state = fullSyncRequest( undefined, erroredFullSyncRequest );
			expect( state ).toHaveProperty( String( erroredSyncStatusRequest.siteId ) );
			expect( state[ erroredSyncStatusRequest.siteId ] ).toHaveProperty(
				'error',
				erroredFullSyncRequest.error
			);
		} );
	} );
} );
