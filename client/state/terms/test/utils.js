/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getNormalizedTermsQuery,
	getSerializedTaxonomyTermsQuery,
	getSerializedTaxonomyTermsQueryWithoutPage
} from '../utils';

describe( 'utils', () => {
	describe( 'getNormalizedTermsQuery()', () => {
		it( 'should exclude default values', () => {
			const query = getNormalizedTermsQuery( {
				page: 2,
				number: 100
			} );

			expect( query ).to.eql( {
				page: 2
			} );
		} );
	} );

	describe( 'getSerializedTaxonomyTermsQuery()', () => {
		it( 'should return a JSON string of a normalized query', () => {
			const serializedQuery = getSerializedTaxonomyTermsQuery( {
				search: 'ribs',
				page: 1,
			}, 'categories', 2916284 );

			expect( serializedQuery ).to.equal( '2916284:categories:{"search":"ribs"}' );
		} );

		it( 'should lowercase the result', () => {
			const serializedQuery = getSerializedTaxonomyTermsQuery( {
				search: 'Chicken',
				page: '2'
			}, 'categories', 2916284 );

			expect( serializedQuery ).to.equal( '2916284:categories:{"search":"chicken","page":"2"}' );
		} );
	} );

	describe( 'getSerializedTaxonomyTermsQueryWithoutPage()', () => {
		it( 'should return a JSON string of a normalized query omitting page', () => {
			const serializedQuery = getSerializedTaxonomyTermsQueryWithoutPage( {
				search: 'ribs',
				page: 2
			}, 'tags', 2916284 );

			expect( serializedQuery ).to.equal( '2916284:tags:{"search":"ribs"}' );
		} );

		it( 'should lowercase the result', () => {
			const serializedQuery = getSerializedTaxonomyTermsQueryWithoutPage( {
				search: 'ChiCKEN',
				page: 2
			}, 'tags', 2916284 );

			expect( serializedQuery ).to.equal( '2916284:tags:{"search":"chicken"}' );
		} );
	} );
} );
