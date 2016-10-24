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
	READER_SITE_UPDATE,
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
				name: 'my site',
				title: 'my site'
			} );
		} );

		it( 'should fallback to using the domain for the title if name is missing', () => {
			expect(
				items( {}, {
					type: READER_SITE_REQUEST_SUCCESS,
					payload: {
						ID: 1,
						URL: 'http://example.com/foo/bar'
					}
				} )[ 1 ]
			).to.deep.equal( {
				ID: 1,
				URL: 'http://example.com/foo/bar',
				domain: 'example.com/foo/bar',
				slug: 'example.com::foo::bar',
				title: 'example.com/foo/bar'
			} );
		} );

		it( 'should set the domain and slug from the url', () => {
			expect(
				items( {}, {
					type: READER_SITE_REQUEST_SUCCESS,
					payload: {
						ID: 1,
						URL: 'http://example.com/foo/bar',
						name: 'example!'
					}
				} )[ 1 ]
			).to.deep.equal( {
				ID: 1,
				URL: 'http://example.com/foo/bar',
				domain: 'example.com/foo/bar',
				slug: 'example.com::foo::bar',
				name: 'example!',
				title: 'example!'
			} );
		} );

		it( 'should set the domain and slug from the url unless it is a site redirect', () => {
			expect(
				items( {}, {
					type: READER_SITE_REQUEST_SUCCESS,
					payload: {
						ID: 1,
						URL: 'http://example.com/foo/bar',
						name: 'example!',
						options: {
							is_redirect: true,
							unmapped_url: 'http://formerlyexample.com/foo/bar'
						}
					}
				} )[ 1 ]
			).to.deep.equal( {
				ID: 1,
				URL: 'http://example.com/foo/bar',
				domain: 'formerlyexample.com/foo/bar',
				slug: 'formerlyexample.com/foo/bar',
				name: 'example!',
				title: 'example!',
				options: {
					is_redirect: true,
					unmapped_url: 'http://formerlyexample.com/foo/bar'
				}
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
			} ) ).to.deep.equal( { 666: { ID: 666, name: 'new', title: 'new' } } );
		} );

		it( 'should leave an existing entry alone if an error is received', ( ) => {
			const startingState = deepFreeze( { 666: { ID: 666, name: 'valid' } } );
			expect( items( startingState, {
				type: READER_SITE_REQUEST_FAILURE,
				error: new Error( 'request failed' ),
				payload: { ID: 666 }
			} ) ).to.deep.equal( startingState );
		} );

		it( 'should accept updates', () => {
			const startingState = deepFreeze( {
				666: { ID: 666, name: 'valid' },
				777: { ID: 777, name: 'second valid' }
			} );
			expect( items( startingState, {
				type: READER_SITE_UPDATE,
				payload: [
					{ ID: 1, name: 'first' },
					{ ID: 2, name: 'second' },
					{ ID: 666, name: 'valid but updated' }
				]
			} ) ).to.deep.equal( {
				1: { ID: 1, name: 'first', title: 'first' },
				2: { ID: 2, name: 'second', title: 'second' },
				666: { ID: 666, name: 'valid but updated', title: 'valid but updated' },
				777: { ID: 777, name: 'second valid' }
			} );
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
