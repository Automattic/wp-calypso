/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getNormalizedTermsQuery,
	getSerializedTermsQuery,
	getSerializedTermsQueryWithoutPage
} from '../utils';

describe( 'utils', () => {
	describe( 'getSerializedTermsQueryWithoutPage()', () => {
		it( 'should exclude page and default values', () => {
			const query = getSerializedTermsQueryWithoutPage( {
				page: 2,
				number: 100,
				search: 'ribs'
			} );

			expect( query ).to.eql( '{"search":"ribs"}' );
		} );
	} );

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

	describe( 'getSerializedTermsQuery()', () => {
		it( 'should return a JSON string of a normalized query', () => {
			const serializedQuery = getSerializedTermsQuery( {
				search: 'ribs',
				page: 1,
			} );

			expect( serializedQuery ).to.equal( '{"search":"ribs"}' );
		} );

		it( 'should lowercase the result', () => {
			const serializedQuery = getSerializedTermsQuery( {
				search: 'Chicken',
				page: '2'
			} );

			expect( serializedQuery ).to.equal( '{"search":"chicken","page":"2"}' );
		} );
	} );
} );
