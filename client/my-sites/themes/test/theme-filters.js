/**
 * Tests for theme-filters.js
 */

/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import {
	getFilter,
	getSortedFilterTerms,
	stripFilters,
	sortFilterTerms,
	filterIsValid,
	isValidTerm,
} from '../theme-filters.js';

describe( 'theme-filters', () => {
	describe( 'getFilter', () => {
		it( 'should return taxonomy:term filter given the term', () => {
			assert.equal( getFilter( 'pink' ), 'color:pink' );
			assert.equal( getFilter( 'real-estate' ), 'subject:real-estate' );
		} );

		it( 'should return empty string given an invalid term', () => {
			assert.equal( getFilter( '' ), '' );
			assert.equal( getFilter( ' ' ), '' );
			assert.equal( getFilter( ' pink' ), '' );
			assert.equal( getFilter( 'pink ' ), '' );
			assert.equal( getFilter( 'ponk' ), '' );
		} );
	} );

	describe( 'sortFilterTerms', () => {
		it( 'should alpha sort by taxonomy:term', () => {
			const sorted = sortFilterTerms(
				[ 'post-slider', 'blue', 'yellow' ]
			);
			// alpha-sort following strings:
			// 'feature:post-slider'
			// 'color:blue'
			// 'color:yellow'
			assert.deepEqual( sorted, [ 'blue', 'yellow', 'post-slider' ] );
		} );

		it( 'should strip invalid terms', () => {
			const sorted = sortFilterTerms(
				[ 'yellow', 'yaya', 'blue' ]
			);
			assert.deepEqual( sorted, [ 'blue', 'yellow' ] );
		} );
	} );

	describe( 'getSortedFilterTerms', () => {
		it( 'should return terms from a mixed input string', () => {
			const terms = getSortedFilterTerms( 'blah rah color:blue yah feature:post-slider blah' );
			assert.equal( terms, 'blue,post-slider' );
		} );

		it( 'should ignore invalid filters', () => {
			const terms = getSortedFilterTerms( 'color:lazer-puce subject:business' );
			assert.equal( terms, 'business' );
		} );

		it( 'should return empty string if no valid filters', () => {
			const terms = getSortedFilterTerms( 'blah color:lazer-puce' );
			assert.equal( terms, '' );
		} );
	} );

	describe( 'stripFilters', () => {
		it( 'should strip filters from a mixed input string', () => {
			const remaining = stripFilters( 'blah color:blue yah' );
			assert.equal( remaining, 'blah yah' );
		} );

		it( 'should still strip invalid filters', () => {
			const remaining = stripFilters( 'color:blue twenty color:lazer-puce' );
			assert.equal( remaining, 'twenty' );
		} );
	} );

	describe( 'filterIsValid', () => {
		it( 'should return true for a valid filter string', () => {
			assert.isTrue( filterIsValid( 'subject:music' ) );
		} );

		it( 'should return false for an invalid filter string', () => {
			assert.isFalse( filterIsValid( 'subject' ) );
			assert.isFalse( filterIsValid( 'music' ) );
			assert.isFalse( filterIsValid( '' ) );
			assert.isFalse( filterIsValid( 'subject:' ) );
			assert.isFalse( filterIsValid( ':music' ) );
			assert.isFalse( filterIsValid( ':' ) );
		} );
	} );

	describe( 'isValidTerm', () => {
		it( 'should return true for a valid term string', () => {
			assert.isTrue( isValidTerm( 'music' ) );
			assert.isTrue( isValidTerm( 'feature:video' ) );
		} );

		it( 'should return false for an invalid filter string', () => {
			assert.isFalse( isValidTerm( 'video' ) );
			assert.isFalse( isValidTerm( '' ) );
			assert.isFalse( isValidTerm( ':video' ) );
			assert.isFalse( isValidTerm( ':' ) );
		} );
	} );
} );
