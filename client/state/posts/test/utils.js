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
