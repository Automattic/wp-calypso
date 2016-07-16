/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getNormalizedPostsQuery,
	getSerializedPostsQuery,
	getDeserializedPostsQueryDetails,
	getSerializedPostsQueryWithoutPage,
	mergeIgnoringArrays
} from '../utils';

describe( 'utils', () => {
	describe( '#getNormalizedPostsQuery()', () => {
		it( 'should exclude default values', () => {
			const query = getNormalizedPostsQuery( {
				page: 4,
				number: 20
			} );

			expect( query ).to.eql( {
				page: 4
			} );
		} );
	} );

	describe( '#getSerializedPostsQuery()', () => {
		it( 'should return a JSON string of a normalized query', () => {
			const serializedQuery = getSerializedPostsQuery( {
				type: 'page',
				page: 1
			} );

			expect( serializedQuery ).to.equal( '{"type":"page"}' );
		} );

		it( 'should prefix site ID if specified', () => {
			const serializedQuery = getSerializedPostsQuery( {
				search: 'Hello'
			}, 2916284 );

			expect( serializedQuery ).to.equal( '2916284:{"search":"Hello"}' );
		} );
	} );

	describe( 'getDeserializedPostsQueryDetails()', () => {
		it( 'should return undefined query and site if string does not contain JSON', () => {
			const queryDetails = getDeserializedPostsQueryDetails( 'bad' );

			expect( queryDetails ).to.eql( {
				siteId: undefined,
				query: undefined
			} );
		} );

		it( 'should return query but not site if string does not contain site prefix', () => {
			const queryDetails = getDeserializedPostsQueryDetails( '{"search":"hello"}' );

			expect( queryDetails ).to.eql( {
				siteId: undefined,
				query: { search: 'hello' }
			} );
		} );

		it( 'should return query and site if string contains site prefix and JSON', () => {
			const queryDetails = getDeserializedPostsQueryDetails( '2916284:{"search":"hello"}' );

			expect( queryDetails ).to.eql( {
				siteId: 2916284,
				query: { search: 'hello' }
			} );
		} );
	} );

	describe( '#getSerializedPostsQueryWithoutPage()', () => {
		it( 'should return a JSON string of a normalized query omitting page', () => {
			const serializedQuery = getSerializedPostsQueryWithoutPage( {
				type: 'page',
				page: 2
			} );

			expect( serializedQuery ).to.equal( '{"type":"page"}' );
		} );

		it( 'should prefix site ID if specified', () => {
			const serializedQuery = getSerializedPostsQueryWithoutPage( {
				search: 'Hello',
				page: 2
			}, 2916284 );

			expect( serializedQuery ).to.equal( '2916284:{"search":"Hello"}' );
		} );
	} );

	describe( 'mergeIgnoringArrays()', () => {
		it( 'should merge into an empty object', () => {
			const merged = mergeIgnoringArrays( {}, {
				tags_by_id: [ 4, 5, 6 ]
			} );

			expect( merged ).to.eql( {
				tags_by_id: [ 4, 5, 6 ]
			} );
		} );

		it( 'should not modify array properties in the original object', () => {
			const merged = mergeIgnoringArrays( {
				tags_by_id: [ 4, 5, 6 ]
			}, {} );

			expect( merged ).to.eql( {
				tags_by_id: [ 4, 5, 6 ]
			} );
		} );

		it( 'should allow removing array items', () => {
			const merged = mergeIgnoringArrays( {}, {
				tags_by_id: [ 4, 5, 6 ]
			}, {
				tags_by_id: [ 4, 6 ]
			} );

			expect( merged ).to.eql( {
				tags_by_id: [ 4, 6 ]
			} );
		} );

		it( 'should replace arrays with the new value', () => {
			const merged = mergeIgnoringArrays( {}, {
				tags_by_id: [ 4, 5, 6 ]
			}, {
				tags_by_id: [ 1, 2, 3, 4 ]
			} );

			expect( merged ).to.eql( {
				tags_by_id: [ 1, 2, 3, 4 ]
			} );
		} );
	} );
} );
