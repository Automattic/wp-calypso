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
	JETPACK_SYNC_STATUS_RECEIVED,
	JETPACK_SYNC_STATUS_SUCCESS,
	JETPACK_SYNC_STATUS_ERROR,
	SERIALIZE,
} from 'state/action-types';

import reducer, {
	jetpackSync
} from '../reducer';

import { getExpectedResponseKeys } from '../utils';

const successfulRequest = {
	type: JETPACK_SYNC_STATUS_SUCCESS,
	siteId: 1234567,
	data: {
		started: 1466010260,
		queue_finished: 1466010260,
		sent_started: 1466010290,
		finished: 1466010313,
		queue: {
			constants: 1,
			functions: 1,
			options: 1,
			terms: 3,
			themes: 1,
			users: 2,
			posts: 15,
			comments: 1,
			updates: 6
		},
		sent: {
			constants: 1,
			functions: 1,
			options: 1,
			terms: 3,
			themes: 1,
			users: 2,
			posts: 15,
			comments: 1
		},
		_headers: {
			Date: 'Wed, 15 Jun 2016 17:05:26 GMT',
			'Content-Type': 'application/json'
		}
	}
};

const erroredRequest = {
	type: JETPACK_SYNC_STATUS_ERROR,
	siteId: 1234578,
	error: {
		statusCode: 400
	}
}

describe( 'reducer', () => {
	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'jetpackSync'
		] );
	} );

	describe( '#jetpackSync()', () => {
		it( 'should default to an empty object', () => {
			const state = jetpackSync( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should not persist state', () => {
			const original = deepFreeze( {
				123456: {
					isRequesting: true
				}
			} );

			const state = jetpackSync( original, { type: SERIALIZE } );
			expect( state ).to.eql( {} );
		} );

		it( 'should add a property with key matching site ID', () => {
			const state = jetpackSync( undefined, { type: JETPACK_SYNC_STATUS_REQUEST, siteId: 123456 } );
			expect( state ).to.have.property( '123456' );
		} );

		it( 'should store more than one site as separate properties', () => {
			const state = jetpackSync(
				jetpackSync( undefined, successfulRequest ),
				erroredRequest
			);
			expect( state ).to.have.all.keys(
				String( successfulRequest.siteId ),
				String( erroredRequest.siteId )
			);
		} );

		it( 'should set isRequesting to true when fetching for a site', () => {
			const state = jetpackSync( undefined, { type: JETPACK_SYNC_STATUS_REQUEST, siteId: 123456 } );
			expect( state ).to.eql( {
				123456: {
					isRequesting: true
				}
			} );
		} );

		it( 'should set isRequesting to false when finished fetching for a site', () => {
			const state = jetpackSync( undefined, { type: JETPACK_SYNC_STATUS_RECEIVED, siteId: 123456 } );
			expect( state ).to.eql( {
				123456: {
					isRequesting: false
				}
			} );
		} );

		it( 'should store expected response keys on success', () => {
			const state = jetpackSync( undefined, successfulRequest );
			expect( state ).to.have.property( successfulRequest.siteId )
				.to.have.all.keys( getExpectedResponseKeys().concat( [ 'error', 'isRequesting' ] ) );
		} );

		it( 'should store error object when request errors', () => {
			const state = jetpackSync( undefined, erroredRequest );
			expect( state ).to.have.property( erroredRequest.siteId )
				.to.have.property( 'error' )
				.to.be.eql( erroredRequest.error );
		} );
	} );
} );
