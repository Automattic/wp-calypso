import deepFreeze from 'deep-freeze';
import {
	READER_SITE_BLOCKS_RECEIVE,
	READER_SITE_REQUEST,
	READER_SITE_REQUEST_SUCCESS,
	READER_SITE_REQUEST_FAILURE,
} from 'calypso/state/reader/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import { items, queuedRequests, lastFetched } from '../reducer';

describe( 'reducer', () => {
	describe( 'items', () => {
		test( 'should return an empty map by default', () => {
			expect( items( undefined, {} ) ).toEqual( {} );
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
			).toEqual( {
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
			).toEqual( {
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
			).toEqual( {
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
			).toEqual( {
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
			).toHaveProperty( 'description', 'Apples&Pears' );
		} );

		test( 'should serialize site entries', () => {
			const unvalidatedObject = deepFreeze( { hi: 'there' } );
			expect( serialize( items, unvalidatedObject ) ).toEqual( unvalidatedObject );
		} );

		test( 'should not serialize errors', () => {
			const stateWithErrors = deepFreeze( {
				12: { ID: 12, name: 'yes' },
				666: {
					ID: 666,
					is_error: true,
				},
			} );
			expect( serialize( items, stateWithErrors ) ).toEqual( {
				12: { ID: 12, name: 'yes' },
			} );
		} );

		test( 'should reject deserializing entries it cannot validate', () => {
			const consoleSpy = jest.spyOn( console, 'warn' ).mockImplementation( () => {} );
			const unvalidatedObject = deepFreeze( { hi: 'there' } );
			expect( deserialize( items, unvalidatedObject ) ).toEqual( {} );
			consoleSpy.mockRestore();
		} );

		test( 'should deserialize good things', () => {
			const validState = deepFreeze( {
				1234: {
					ID: 1234,
					name: 'Example Dot Com',
				},
			} );
			expect( deserialize( items, validState ) ).toEqual( validState );
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
			).toEqual( { 666: { ID: 666, is_error: true, error: { statusCode: 410 } } } );
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
			).toEqual( { 666: { ID: 666, name: 'new', title: 'new' } } );
		} );

		test( 'should leave an existing entry alone if an error is received', () => {
			const startingState = deepFreeze( { 666: { ID: 666, name: 'valid' } } );
			expect(
				items( startingState, {
					type: READER_SITE_REQUEST_FAILURE,
					error: { statusCode: 500 },
					payload: { ID: 666 },
				} )
			).toEqual( startingState );
		} );

		test( 'should accept site details from site blocks', () => {
			const startingState = deepFreeze( {
				666: { ID: 666, name: 'valid' },
				777: { ID: 777, name: 'second valid' },
			} );
			expect(
				items( startingState, {
					type: READER_SITE_BLOCKS_RECEIVE,
					payload: {
						sites: [
							{ ID: 1, name: 'first' },
							{ ID: 2, name: 'second' },
						],
					},
				} )
			).toEqual( {
				1: { ID: 1, name: 'first' },
				2: { ID: 2, name: 'second' },
				666: { ID: 666, name: 'valid' },
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
			).toEqual( { 1: true } );
		} );

		test( 'should remove the feed from the set inflight', () => {
			expect(
				queuedRequests( deepFreeze( { 1: true } ), {
					type: READER_SITE_REQUEST_SUCCESS,
					payload: { ID: 1 },
				} )
			).toEqual( {} );
		} );
	} );

	describe( 'lastFetched', () => {
		test( 'should update the last fetched time on request success', () => {
			const original = deepFreeze( {} );
			const action = {
				type: READER_SITE_REQUEST_SUCCESS,
				payload: { ID: 1 },
			};
			const result = lastFetched( original, action );
			expect( result ).toHaveProperty( '1' );
			expect( result[ 1 ] ).toEqual( expect.any( Number ) );
		} );
	} );
} );
