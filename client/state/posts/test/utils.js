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
		it( 'should default page if not specified', () => {
			const query = getNormalizedPostsQuery( {
				posts_per_page: 40
			} );

			expect( query ).to.eql( {
				page: 1,
				posts_per_page: 40
			} );
		} );

		it( 'should default posts_per_page if not specified', () => {
			const query = getNormalizedPostsQuery( {
				page: 4
			} );

			expect( query ).to.eql( {
				page: 4,
				posts_per_page: 20
			} );
		} );
	} );

	describe( '#getSerializedPostsQuery()', () => {
		it( 'should return a JSON string of a normalized query', () => {
			const serializedQuery = getSerializedPostsQuery( {
				type: 'posts'
			} );

			expect( serializedQuery ).to.equal( '{"page":1,"posts_per_page":20,"type":"posts"}' );
		} );
	} );

	describe( '#getSerializedPostsQueryWithoutPage()', () => {
		it( 'should return a JSON string of a normalized query omitting page', () => {
			const serializedQuery = getSerializedPostsQueryWithoutPage( {
				type: 'posts'
			} );

			expect( serializedQuery ).to.equal( '{"posts_per_page":20,"type":"posts"}' );
		} );
	} );
} );
