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
	TERMS_RECEIVE,
	TERMS_REQUEST,
	TERMS_REQUEST_FAILURE,
	TERMS_REQUEST_SUCCESS,
	SERIALIZE
} from 'state/action-types';
import reducer, {
	items,
	queries,
	queryRequests,
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
			'queries',
			'queryRequests',
			'items'
		] );
	} );

	describe( 'queryRequests()', () => {
		it( 'should default to an empty object', () => {
			const state = queryRequests( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track term query request fetching', () => {
			const state = queryRequests( undefined, {
				type: TERMS_REQUEST,
				siteId: 2916284,
				query: { search: 'Ribs' },
				taxonomy: 'categories'
			} );

			expect( state ).to.eql( {
				'2916284:categories:{"search":"ribs"}': true
			} );
		} );

		it( 'should accumulate queries', () => {
			const original = deepFreeze( {
				'2916284:categories:{"search":"ribs"}': true
			} );

			const state = queryRequests( original, {
				type: TERMS_REQUEST,
				siteId: 2916284,
				query: { search: 'AND Chicken' },
				taxonomy: 'categories'
			} );

			expect( state ).to.eql( {
				'2916284:categories:{"search":"ribs"}': true,
				'2916284:categories:{"search":"and chicken"}': true
			} );
		} );

		it( 'should track term query request success', () => {
			const state = queryRequests( undefined, {
				type: TERMS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Ribs' },
				found: testTerms.length,
				terms: testTerms,
				taxonomy: 'categories'
			} );

			expect( state ).to.eql( {
				'2916284:categories:{"search":"ribs"}': false
			} );
		} );

		it( 'should track term query request failure', () => {
			const state = queryRequests( undefined, {
				type: TERMS_REQUEST_FAILURE,
				siteId: 2916284,
				query: { search: 'Ribs' },
				error: new Error(),
				taxonomy: 'categories'
			} );

			expect( state ).to.eql( {
				'2916284:categories:{"search":"ribs"}': false
			} );
		} );

		it( 'should never persist state', () => {
			const original = deepFreeze( {
				'2916284:categories:{"search":"ribs"}': true
			} );

			const state = queryRequests( original, { type: SERIALIZE } );

			expect( state ).to.eql( {} );
		} );

		it( 'should never load persisted state', () => {
			const original = deepFreeze( {
				'2916284:categories:{"search":"ribs"}': true
			} );

			const state = queryRequests( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'queries()', () => {
		it( 'should default to an empty object', () => {
			const state = queries( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track term query request success', () => {
			const state = queries( undefined, {
				type: TERMS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Ribs' },
				found: 2,
				terms: testTerms,
				taxonomy: 'categories'
			} );

			expect( state ).to.eql( {
				'2916284:categories:{"search":"ribs"}': [ 111, 123 ]
			} );
		} );

		it( 'should accumulate query request success', () => {
			const original = deepFreeze( {
				'2916284:categories:{"search":"ribs"}': [ 111 ]
			} );
			const state = queries( original, {
				type: TERMS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'And Chicken' },
				found: 1,
				terms: [ { ID: 777, name: 'Noms' } ],
				taxonomy: 'categories'
			} );

			expect( state ).to.eql( {
				'2916284:categories:{"search":"ribs"}': [ 111 ],
				'2916284:categories:{"search":"and chicken"}': [ 777 ]
			} );
		} );

		it( 'should persist state', () => {
			const original = deepFreeze( {
				'2916284:categories:{"search":"ribs"}': [ 111 ]
			} );

			const state = queries( original, { type: SERIALIZE } );

			expect( state ).to.eql( {
				'2916284:categories:{"search":"ribs"}': [ 111 ]
			} );
		} );

		it( 'should load persisted state', () => {
			const original = deepFreeze( {
				'2916284:categories:{"search":"ribs"}': [ 111 ]
			} );

			const state = queries( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {
				'2916284:categories:{"search":"ribs"}': [ 111 ]
			} );
		} );

		it( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				2916284: [ 111 ]
			} );

			const state = queries( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'items()', () => {
		it( 'should persist state', () => {
			const original = deepFreeze( {
				2916284: {
					'jetpack-portfolio': keyedTestTerms
				}
			} );
			const state = items( original, { type: SERIALIZE } );

			expect( state ).to.eql( original );
		} );

		it( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					'jetpack-portfolio': keyedTestTerms
				}
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( original );
		} );

		it( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
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
				siteId: 2916284,
				taxonomy: 'jetpack-portfolio',
				terms: testTerms
			} );

			expect( state ).to.eql( {
				2916284: {
					'jetpack-portfolio': keyedTestTerms
				}
			} );
		} );

		it( 'should accumulate received terms by taxonomy', () => {
			const original = deepFreeze( {
				2916284: {
					'jetpack-portfolio': keyedTestTerms
				}
			} );

			const state = items( original, {
				type: TERMS_RECEIVE,
				siteId: 2916284,
				taxonomy: 'jetpack-portfolio',
				terms: moreTerms
			} );

			const expectedTerms = merge( {}, keyedTestTerms, keyedMoreTerms );

			expect( state ).to.eql( {
				2916284: {
					'jetpack-portfolio': expectedTerms
				}
			} );
		} );

		it( 'should add additional terms', () => {
			const original = deepFreeze( {
				2916284: {
					'jetpack-portfolio': keyedTestTerms
				}
			} );

			const state = items( original, {
				type: TERMS_RECEIVE,
				siteId: 2916284,
				taxonomy: 'amazing-taxonomy',
				terms: moreTerms
			} );

			expect( state ).to.eql( {
				2916284: {
					'amazing-taxonomy': keyedMoreTerms,
					'jetpack-portfolio': keyedTestTerms
				}
			} );
		} );
	} );
} );
