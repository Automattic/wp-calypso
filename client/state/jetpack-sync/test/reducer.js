/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	JETPACK_SYNC_STATUS_REQUEST,
	JETPACK_SYNC_STATUS_SUCCESS,
	JETPACK_SYNC_STATUS_ERROR,
	JETPACK_SYNC_START_REQUEST,
	JETPACK_SYNC_START_SUCCESS,
	JETPACK_SYNC_START_ERROR,
	SERIALIZE,
} from 'state/action-types';

import reducer, {
	syncStatus,
	fullSyncRequest
} from '../reducer';

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
			updates: 1
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
			updates: 1
		},
		sent: {
			constants: 1,
			functions: 1,
			options: 1,
			terms: 25,
			themes: 1,
			users: 1,
			posts: 193
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
			updates: true
		},
		queue_size: 0,
		queue_lag: 0,
		full_queue_size: 239,
		full_queue_lag: 957.49082708359,
		is_scheduled: false,
		_headers: {
			Date: 'Mon, 01 Aug 2016 21:18:47 GMT',
			'Content-Type': 'application/json'
		}
	}
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
			updates: 1
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
			updates: 1
		},
		sent: {
			constants: 1,
			functions: 1,
			options: 1,
			terms: 2
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
			updates: true
		},
		queue_size: 0,
		queue_lag: 0,
		full_queue_size: 457,
		full_queue_lag: 33.257718086243,
		is_scheduled: false,
		_headers: {
			Date: 'Mon, 01 Aug 2016 16:36:53 GMT',
			'Content-Type': 'application/json'
		}
	}
};

const erroredSyncStatusRequest = {
	type: JETPACK_SYNC_STATUS_ERROR,
	siteId: 1234578,
	error: {
		statusCode: 400
	}
};

const successfulFullSyncRequest = {
	type: JETPACK_SYNC_START_SUCCESS,
	siteId: 1234567,
	data: {
		scheduled: true,
		_headers: {
			Date: 'Wed, 15 Jun 2016 17:05:26 GMT',
			'Content-Type': 'application/json'
		}
	}
};

const erroredFullSyncRequest = {
	type: JETPACK_SYNC_START_ERROR,
	siteId: 1234578,
	error: {
		statusCode: 400
	}
};

describe( 'reducer', () => {
	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'syncStatus',
			'fullSyncRequest'
		] );
	} );

	describe( '#syncStatus()', () => {
		it( 'should default to an empty object', () => {
			const state = syncStatus( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should not persist state', () => {
			const original = deepFreeze( {
				123456: {
					isRequesting: true
				}
			} );

			const state = syncStatus( original, { type: SERIALIZE } );
			expect( state ).to.eql( {} );
		} );

		it( 'should add a property with key matching site ID', () => {
			const state = syncStatus( undefined, { type: JETPACK_SYNC_STATUS_REQUEST, siteId: 123456 } );
			expect( state ).to.have.property( '123456' );
		} );

		it( 'should store more than one site as separate properties', () => {
			const state = syncStatus(
				syncStatus( undefined, successfulSyncStatusRequest ),
				erroredSyncStatusRequest
			);
			expect( state ).to.have.all.keys(
				String( successfulSyncStatusRequest.siteId ),
				String( erroredSyncStatusRequest.siteId )
			);
		} );

		it( 'should set isRequesting to true when fetching for a site', () => {
			const state = syncStatus( undefined, { type: JETPACK_SYNC_STATUS_REQUEST, siteId: 123456 } );
			expect( state ).to.eql( {
				123456: {
					isRequesting: true
				}
			} );
		} );

		it( 'should set isRequesting to false when finished successfully fetching for a site', () => {
			const state = syncStatus( undefined, successfulSyncStatusRequest );
			expect( state ).to.have.property( String( successfulSyncStatusRequest.siteId ) )
				.to.have.property( 'isRequesting' )
				.to.be.eql( false );
		} );

		it( 'should set error to false when finished fetching for a site', () => {
			const state = syncStatus( undefined, successfulSyncStatusRequest );
			expect( state ).to.have.property( String( successfulSyncStatusRequest.siteId ) )
				.to.have.property( 'error' )
				.to.be.eql( false );
		} );

		it( 'should set lastSuccessfulStatus to current time when finished fetching for a site', () => {
			const startTime = Date.now();
			const state = syncStatus( undefined, inProgressSyncStatusRequest );
			expect( state ).to.have.property( String( inProgressSyncStatusRequest.siteId ) )
				.to.have.property( 'lastSuccessfulStatus' )
				.to.be.at.least( startTime );
		} );

		it( 'should store expected response keys on success', () => {
			const state = syncStatus( undefined, successfulSyncStatusRequest );
			expect( state ).to.have.property( successfulSyncStatusRequest.siteId )
				.to.have.all.keys( getExpectedResponseKeys().concat( [
					'error',
					'isRequesting',
					'lastSuccessfulStatus',
					'errorCounter'
				] ) );
		} );

		it( 'should set errorCounter to 0 after a successful request', () => {
			const state = syncStatus( undefined, successfulSyncStatusRequest );
			expect( state ).to.have.property( String( successfulSyncStatusRequest.siteId ) )
				.to.have.property( 'errorCounter' )
				.to.be.eql( 0 );
		} );

		it( 'should set isRequesting to false when fetching for a site errors', () => {
			const state = syncStatus( undefined, erroredSyncStatusRequest );
			expect( state ).to.have.property( String( erroredSyncStatusRequest.siteId ) )
				.to.have.property( 'isRequesting' )
				.to.be.eql( false );
		} );

		it( 'should set error when fetching for a site errors', () => {
			const state = syncStatus( undefined, erroredSyncStatusRequest );
			expect( state ).to.have.property( String( erroredSyncStatusRequest.siteId ) )
				.to.have.property( 'error' )
				.to.be.eql( erroredSyncStatusRequest.error );
		} );

		it( 'should set errorCounter to 1 when errorCounter previously undefined', () => {
			const state = syncStatus( undefined, erroredSyncStatusRequest );
			expect( state ).to.have.property( String( erroredSyncStatusRequest.siteId ) )
				.to.have.property( 'errorCounter' )
				.to.be.eql( 1 );
		} );

		it( 'should increment errorCounter when multiple errors occur', () => {
			const state = syncStatus(
				syncStatus( undefined, erroredSyncStatusRequest ),
				erroredSyncStatusRequest
			);

			expect( state ).to.have.property( String( erroredSyncStatusRequest.siteId ) )
				.to.have.property( 'errorCounter' )
				.to.be.eql( 2 );
		} );
	} );

	describe( '#fullSyncRequest()', () => {
		it( 'should default to an empty object', () => {
			const state = fullSyncRequest( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should not persist state', () => {
			const original = deepFreeze( {
				123456: {
					isRequesting: true
				}
			} );

			const state = fullSyncRequest( original, { type: SERIALIZE } );
			expect( state ).to.eql( {} );
		} );

		it( 'should add a property with key matching site ID', () => {
			const state = fullSyncRequest( undefined, { type: JETPACK_SYNC_START_REQUEST, siteId: 123456 } );
			expect( state ).to.have.property( '123456' );
		} );

		it( 'should set isRequesting to true when fetching for a site', () => {
			const siteId = 123456;
			const state = fullSyncRequest( undefined, { type: JETPACK_SYNC_START_REQUEST, siteId } );
			expect( state ).to.have.property( String( siteId ) )
				.to.have.property( 'isRequesting' )
				.to.be.eql( true );
		} );

		it( 'should set lastRequest when fetching for a site', () => {
			const siteId = 123456;
			const startTime = Date.now();
			const state = fullSyncRequest( undefined, { type: JETPACK_SYNC_START_REQUEST, siteId } );
			expect( state ).to.have.property( String( siteId ) )
				.to.have.property( 'lastRequested' )
				.to.be.at.least( startTime );
		} );

		it( 'should store more than one site as separate properties', () => {
			const state = fullSyncRequest(
				fullSyncRequest( undefined, successfulFullSyncRequest ),
				erroredFullSyncRequest
			);
			expect( state ).to.have.all.keys(
				String( successfulFullSyncRequest.siteId ),
				String( erroredFullSyncRequest.siteId )
			);
		} );

		it( 'should set isRequesting to false after successfully scheduling sync', () => {
			const state = fullSyncRequest( undefined, successfulFullSyncRequest );
			expect( state ).to.have.property( String( successfulFullSyncRequest.siteId ) )
				.to.have.property( 'isRequesting' )
				.to.be.eql( false );
		} );

		it( 'should set error to false after successfully scheduling sync', () => {
			const state = fullSyncRequest( undefined, successfulFullSyncRequest );
			expect( state ).to.have.property( String( successfulFullSyncRequest.siteId ) )
				.to.have.property( 'error' )
				.to.be.eql( false );
		} );

		it( 'should set scheduled after successfully scheduling sync', () => {
			const state = fullSyncRequest( undefined, successfulFullSyncRequest );
			expect( state ).to.have.property( String( successfulFullSyncRequest.siteId ) )
				.to.have.property( 'scheduled' )
				.to.be.eql( successfulFullSyncRequest.data.scheduled );
		} );

		it( 'should set isRequesting to false after scheduling sync errors', () => {
			const state = fullSyncRequest( undefined, erroredFullSyncRequest );
			expect( state ).to.have.property( String( erroredFullSyncRequest.siteId ) )
				.to.have.property( 'isRequesting' )
				.to.be.eql( false );
		} );

		it( 'should set scheduled to false after scheduling sync errors', () => {
			const state = fullSyncRequest( undefined, erroredFullSyncRequest );
			expect( state ).to.have.property( String( erroredFullSyncRequest.siteId ) )
				.to.have.property( 'scheduled' )
				.to.be.eql( false );
		} );

		it( 'should set error after scheduling sync errors', () => {
			const state = fullSyncRequest( undefined, erroredFullSyncRequest );
			expect( state ).to.have.property( String( erroredFullSyncRequest.siteId ) )
				.to.have.property( 'error' )
				.to.be.eql( erroredFullSyncRequest.error );
		} );
	} );
} );
