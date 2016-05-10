/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	READER_SITE_REQUEST,
	READER_SITE_REQUEST_SUCCESS,
	READER_SITE_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE } from 'state/action-types';

import { items, queuedRequests } from '../reducer';

describe( 'reducer', ( ) => {
	describe( 'items', ( ) => {
		it( 'should return an empty map by default', ( ) => {
			expect( items( undefined, {} ) ).to.deep.equal( {} );
		} );

		it( 'should update the state when receiving a feed', ( ) => {
			expect(
				items( {}, {
					type: READER_SITE_REQUEST_SUCCESS,
					payload: {
						ID: 1,
						name: 'my site'
					}
				} )[ 1 ]
			).to.deep.equal( {
				ID: 1,
				name: 'my site'
			} );
		} );

		it( 'should serialize site entries', ( ) => {
			const unvalidatedObject = deepFreeze( { hi: 'there' } );
			expect( items( unvalidatedObject, { type: SERIALIZE } ) ).to.deep.equal( unvalidatedObject );
		} );

		it( 'should not serialize errors', ( ) => {
			const stateWithErrors = deepFreeze( {
				12: { ID: 12, name: 'yes' },
				666: {
					ID: 666,
					is_error: true
				}
			} );
			expect( items( stateWithErrors, { type: SERIALIZE } ) ).to.deep.equal( { 12: { ID: 12, name: 'yes' } } );
		} );

		it( 'should reject deserializing entries it cannot validate', sinon.test( function() {
			const unvalidatedObject = deepFreeze( { hi: 'there' } );
			this.stub( console, 'warn' ); // stub warn to suppress the warning that validation failure emits
			expect( items( unvalidatedObject, { type: DESERIALIZE } ) ).to.deep.equal( {} );
		} ) );

		it( 'should deserialize good things', ( ) => {
			const validState = deepFreeze( {
				1234: {
					ID: 1234,
					name: 'Example Dot Com'
				}
			} );
			expect( items( validState, { type: DESERIALIZE } ) ).to.deep.equal( validState );
		} );

		it( 'should stash an error object in the map if the request fails', ( ) => {
			expect( items( {}, {
				type: READER_SITE_REQUEST_FAILURE,
				error: new Error( 'request failed' ),
				payload: { ID: 666 }
			} ) ).to.deep.equal( { 666: { ID: 666, is_error: true } } );
		} );

		it( 'should overwrite an existing entry on receiving a new feed', ( ) => {
			const startingState = deepFreeze( { 666: { ID: 666, name: 'valid' } } );
			expect( items( startingState, {
				type: READER_SITE_REQUEST_SUCCESS,
				payload: {
					ID: 666,
					name: 'new'
				}
			} ) ).to.deep.equal( { 666: { ID: 666, name: 'new' } } );
		} );

		it( 'should leave an existing entry alone if an error is received', ( ) => {
			const startingState = deepFreeze( { 666: { ID: 666, name: 'valid' } } );
			expect( items( startingState, {
				type: READER_SITE_REQUEST_FAILURE,
				error: new Error( 'request failed' ),
				payload: { ID: 666 }
			} ) ).to.deep.equal( startingState );
		} );
	} );

	describe( 'isRequestingFeed', ( ) => {
		it( 'should add to the set of feeds inflight', ( ) => {
			expect( queuedRequests( {}, {
				type: READER_SITE_REQUEST,
				payload: { ID: 1 }
			} ) ).to.deep.equal( { 1: true } );
		} );

		it( 'should remove the feed from the set inflight', ( ) => {
			expect(
				queuedRequests(
					deepFreeze( { 1: true } ),
					{
						type: READER_SITE_REQUEST_SUCCESS,
						payload: { ID: 1 }
					}
				)
			).to.deep.equal( {} );
		} );
	} );
} );
