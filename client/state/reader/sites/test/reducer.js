/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { items, queuedRequests, lastFetched } from '../reducer';
import {
	READER_SITE_REQUEST,
	READER_SITE_REQUEST_SUCCESS,
	READER_SITE_REQUEST_FAILURE,
	READER_SITE_UPDATE,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';

describe( 'reducer', () => {
	describe( 'items', () => {
		test( 'should return an empty map by default', () => {
			expect( items( undefined, {} ) ).to.deep.equal( {} );
		} );

		test( 'should update the state when receiving a feed', () => {
			expect(
				items(
					{},
					{
						type: READER_SITE_REQUEST_SUCCESS,
						payload: {
							ID: 1,
							name: 'my site',
						},
					}
				)[ 1 ]
			).to.deep.equal( {
				ID: 1,
				name: 'my site',
				title: 'my site',
			} );
		} );

		test( 'should fallback to using the domain for the title if name is missing', () => {
			expect(
				items(
					{},
					{
						type: READER_SITE_REQUEST_SUCCESS,
						payload: {
							ID: 1,
							URL: 'http://example.com/foo/bar',
						},
					}
				)[ 1 ]
			).to.deep.equal( {
				ID: 1,
				URL: 'http://example.com/foo/bar',
				domain: 'example.com/foo/bar',
				slug: 'example.com::foo::bar',
				title: 'example.com/foo/bar',
			} );
		} );

		test( 'should set the domain and slug from the url', () => {
			expect(
				items(
					{},
					{
						type: READER_SITE_REQUEST_SUCCESS,
						payload: {
							ID: 1,
							URL: 'http://example.com/foo/bar',
							name: 'example!',
						},
					}
				)[ 1 ]
			).to.deep.equal( {
				ID: 1,
				URL: 'http://example.com/foo/bar',
				domain: 'example.com/foo/bar',
				slug: 'example.com::foo::bar',
				name: 'example!',
				title: 'example!',
			} );
		} );

		test( 'should set the domain and slug from the url unless it is a site redirect', () => {
			expect(
				items(
					{},
					{
						type: READER_SITE_REQUEST_SUCCESS,
						payload: {
							ID: 1,
							URL: 'http://example.com/foo/bar',
							name: 'example!',
							options: {
								is_redirect: true,
								unmapped_url: 'http://formerlyexample.com/foo/bar',
							},
						},
					}
				)[ 1 ]
			).to.deep.equal( {
				ID: 1,
				URL: 'http://example.com/foo/bar',
				domain: 'formerlyexample.com/foo/bar',
				slug: 'formerlyexample.com/foo/bar',
				name: 'example!',
				title: 'example!',
				options: {
					is_redirect: true,
					unmapped_url: 'http://formerlyexample.com/foo/bar',
				},
			} );
		} );

		test( 'should decode entities in the site description', () => {
			expect(
				items(
					{},
					{
						type: READER_SITE_REQUEST_SUCCESS,
						payload: {
							ID: 1,
							description: 'Apples&amp;Pears',
						},
					}
				)[ 1 ]
			)
				.to.have.a.property( 'description' )
				.that.equals( 'Apples&Pears' );
		} );

		test( 'should serialize site entries', () => {
			const unvalidatedObject = deepFreeze( { hi: 'there' } );
			expect( items( unvalidatedObject, { type: SERIALIZE } ) ).to.deep.equal( unvalidatedObject );
		} );

		test( 'should not serialize errors', () => {
			const stateWithErrors = deepFreeze( {
				12: { ID: 12, name: 'yes' },
				666: {
					ID: 666,
					is_error: true,
				},
			} );
			expect( items( stateWithErrors, { type: SERIALIZE } ) ).to.deep.equal( {
				12: { ID: 12, name: 'yes' },
			} );
		} );

		test(
			'should reject deserializing entries it cannot validate',
			sinon.test( function() {
				const unvalidatedObject = deepFreeze( { hi: 'there' } );
				this.stub( console, 'warn' ); // stub warn to suppress the warning that validation failure emits
				expect( items( unvalidatedObject, { type: DESERIALIZE } ) ).to.deep.equal( {} );
			} )
		);

		test( 'should deserialize good things', () => {
			const validState = deepFreeze( {
				1234: {
					ID: 1234,
					name: 'Example Dot Com',
				},
			} );
			expect( items( validState, { type: DESERIALIZE } ) ).to.deep.equal( validState );
		} );

		test( 'should stash an error object in the map if the request fails with a 410', () => {
			expect(
				items(
					{},
					{
						type: READER_SITE_REQUEST_FAILURE,
						error: { statusCode: 410 },
						payload: { ID: 666 },
					}
				)
			).to.deep.equal( { 666: { ID: 666, is_error: true, error: { statusCode: 410 } } } );
		} );

		test( 'should overwrite an existing entry on receiving a new feed', () => {
			const startingState = deepFreeze( { 666: { ID: 666, name: 'valid' } } );
			expect(
				items( startingState, {
					type: READER_SITE_REQUEST_SUCCESS,
					payload: {
						ID: 666,
						name: 'new',
					},
				} )
			).to.deep.equal( { 666: { ID: 666, name: 'new', title: 'new' } } );
		} );

		test( 'should leave an existing entry alone if an error is received', () => {
			const startingState = deepFreeze( { 666: { ID: 666, name: 'valid' } } );
			expect(
				items( startingState, {
					type: READER_SITE_REQUEST_FAILURE,
					error: { statusCode: 500 },
					payload: { ID: 666 },
				} )
			).to.deep.equal( startingState );
		} );

		test( 'should accept updates', () => {
			const startingState = deepFreeze( {
				666: { ID: 666, name: 'valid' },
				777: { ID: 777, name: 'second valid' },
			} );
			expect(
				items( startingState, {
					type: READER_SITE_UPDATE,
					payload: [
						{ ID: 1, name: 'first' },
						{ ID: 2, name: 'second' },
						{ ID: 666, name: 'valid but updated' },
					],
				} )
			).to.deep.equal( {
				1: { ID: 1, name: 'first', title: 'first' },
				2: { ID: 2, name: 'second', title: 'second' },
				666: { ID: 666, name: 'valid but updated', title: 'valid but updated' },
				777: { ID: 777, name: 'second valid' },
			} );
		} );
	} );

	describe( 'isRequestingFeed', () => {
		test( 'should add to the set of feeds inflight', () => {
			expect(
				queuedRequests(
					{},
					{
						type: READER_SITE_REQUEST,
						payload: { ID: 1 },
					}
				)
			).to.deep.equal( { 1: true } );
		} );

		test( 'should remove the feed from the set inflight', () => {
			expect(
				queuedRequests( deepFreeze( { 1: true } ), {
					type: READER_SITE_REQUEST_SUCCESS,
					payload: { ID: 1 },
				} )
			).to.deep.equal( {} );
		} );
	} );

	describe( 'lastFetched', () => {
		test( 'should update the last fetched time on request success', () => {
			const original = deepFreeze( {} );
			const action = {
				type: READER_SITE_REQUEST_SUCCESS,
				payload: { ID: 1 },
			};
			expect( lastFetched( original, action ) )
				.to.have.a.property( 1 )
				.that.is.a( 'number' );
		} );

		test( 'should update the last fetched time on site update', () => {
			const original = deepFreeze( {} );
			const action = {
				type: READER_SITE_UPDATE,
				payload: [ { ID: 1 } ],
			};
			expect( lastFetched( original, action ) )
				.to.have.a.property( 1 )
				.that.is.a( 'number' );
		} );
	} );
} );
