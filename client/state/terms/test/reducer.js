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
	DESERIALIZE,
	SERIALIZE,
	TERMS_RECEIVE
} from 'state/action-types';
import reducer, {
	items
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
			'items'
		] );
	} );

	describe( '#items()', () => {
		it( 'should persist state', () => {
			const original = deepFreeze( {
				777: {
					'jetpack-portfolio': keyedTestTerms
				}
			} );
			const state = items( original, { type: SERIALIZE } );

			expect( state ).to.eql( original );
		} );

		it( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				777: {
					'jetpack-portfolio': keyedTestTerms
				}
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( original );
		} );

		it( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				777: {
					'jetpack-portfolio': {
						111: {}
					}
				}
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );

		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should add received terms', () => {
			const state = items( undefined, {
				type: TERMS_RECEIVE,
				siteId: 777,
				taxonomy: 'jetpack-portfolio',
				terms: testTerms
			} );

			expect( state ).to.eql( {
				777: {
					'jetpack-portfolio': keyedTestTerms
				}
			} );
		} );

		it( 'should accumulate received terms by taxonomy', () => {
			const original = deepFreeze( {
				777: {
					'jetpack-portfolio': keyedTestTerms
				}
			} );

			const state = items( original, {
				type: TERMS_RECEIVE,
				siteId: 777,
				taxonomy: 'jetpack-portfolio',
				terms: moreTerms
			} );

			const expectedTerms = merge( {}, keyedTestTerms, keyedMoreTerms );

			expect( state ).to.eql( {
				777: {
					'jetpack-portfolio': expectedTerms
				}
			} );
		} );

		it( 'should add additional terms', () => {
			const original = deepFreeze( {
				777: {
					'jetpack-portfolio': keyedTestTerms
				}
			} );

			const state = items( original, {
				type: TERMS_RECEIVE,
				siteId: 777,
				taxonomy: 'amazing-taxonomy',
				terms: moreTerms
			} );

			expect( state ).to.eql( {
				777: {
					'amazing-taxonomy': keyedMoreTerms,
					'jetpack-portfolio': keyedTestTerms
				}
			} );
		} );
	} );
} );
