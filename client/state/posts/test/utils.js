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
	getSerializedPostsQueryWithoutPage
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

		it( 'should lowercase the result', () => {
			const serializedQuery = getSerializedPostsQuery( {
				search: 'HeLlO'
			} );

			expect( serializedQuery ).to.equal( '{"search":"hello"}' );
		} );

		it( 'should prefix site ID if specified', () => {
			const serializedQuery = getSerializedPostsQuery( {
				search: 'HeLlO'
			}, 2916284 );

			expect( serializedQuery ).to.equal( '2916284:{"search":"hello"}' );
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

		it( 'should lowercase the result', () => {
			const serializedQuery = getSerializedPostsQueryWithoutPage( {
				search: 'HeLlO',
				page: 2
			} );

			expect( serializedQuery ).to.equal( '{"search":"hello"}' );
		} );

		it( 'should prefix site ID if specified', () => {
			const serializedQuery = getSerializedPostsQueryWithoutPage( {
				search: 'HeLlO',
				page: 2
			}, 2916284 );

			expect( serializedQuery ).to.equal( '2916284:{"search":"hello"}' );
		} );
	} );
} );
