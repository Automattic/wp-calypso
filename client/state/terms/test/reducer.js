/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import keyBy from 'lodash/keyBy';
import merge from 'lodash/merge';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import {
	TERMS_RECEIVE
} from 'state/action-types';
import reducer, {
	terms,
	taxonomies
} from '../reducer';

/**
 * Test Data
 */
const testTerms = [
	{ ID: 111, name: 'Chicken', slug: 'chicken', description: 'cornel sanders', post_count: 1, parent: 0 },
	{ ID: 123, name: 'Ribs', slug: 'ribs', description: 'i want my baby back * 3 ribs', post_count: 100, parent: 0 },
];
const keyedTestTerms = keyBy( testTerms, 'ID' );

const moreTerms = [
	{ ID: 99, name: 'Amazing', slug: 'amazing', description: 'an amazing term', post_count: 1, parent: 0 },
	{ ID: 100, name: 'Term', slug: 'term', description: 'a term about terms', post_count: 100, parent: 0 },
];

const keyedMoreTerms = keyBy( moreTerms, 'ID' );

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'taxonomies', 'terms'
		] );
	} );

	describe( '#terms()', () => {
		it( 'should default to an empty object', () => {
			const state = terms( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should add received terms', () => {
			const state = terms( undefined, {
				type: TERMS_RECEIVE,
				siteId: 777,
				taxonomy: 'jetpack-portfolio',
				terms: testTerms
			} );

			expect( state ).to.eql( {
				777: keyedTestTerms
			} );
		} );

		it( 'should add additional terms', () => {
			const original = deepFreeze( {
				777: keyedTestTerms
			} );

			const state = terms( original, {
				type: TERMS_RECEIVE,
				siteId: 777,
				taxonomy: 'amazing-taxonomy',
				terms: moreTerms
			} );

			const expectedState = merge( {}, keyedTestTerms, keyedMoreTerms );

			expect( state ).to.eql( {
				777: expectedState
			} );
		} );
	} );

	describe( '#taxonomies()', () => {
		it( 'should default to an empty object', () => {
			const state = taxonomies( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should add received term IDs by taxonomy', () => {
			const state = taxonomies( undefined, {
				type: TERMS_RECEIVE,
				siteId: 777,
				taxonomy: 'jetpack-portfolio',
				terms: testTerms
			} );

			expect( state ).to.eql( {
				777: {
					'jetpack-portfolio': [ 111, 123 ]
				}
			} );
		} );

		it( 'should add additional term IDs by taxonomy', () => {
			const original = deepFreeze( {
				777: {
					'amazing-taxonomy': [ 111, 112 ]
				}
			} );

			const state = taxonomies( original, {
				type: TERMS_RECEIVE,
				siteId: 777,
				taxonomy: 'amazing-taxonomy',
				terms: moreTerms
			} );

			expect( state ).to.eql( {
				777: {
					'amazing-taxonomy': [ 111, 112, 99, 100 ]
				}
			} );
		} );

		it( 'should add additional term IDs to correct taxonomy', () => {
			const original = deepFreeze( {
				777: {
					'amazing-taxonomy': [ 111, 112 ]
				}
			} );

			const state = taxonomies( original, {
				type: TERMS_RECEIVE,
				siteId: 777,
				taxonomy: 'not-the-best-taxonomy-a-tribute',
				terms: moreTerms
			} );

			expect( state ).to.eql( {
				777: {
					'amazing-taxonomy': [ 111, 112 ],
					'not-the-best-taxonomy-a-tribute': [ 99, 100 ]
				}
			} );
		} );
	} );
} );
