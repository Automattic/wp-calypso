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
	TERMS_ADD_REQUEST,
	TERMS_ADD_REQUEST_SUCCESS,
	TERMS_ADD_REQUEST_FAILURE,
	TERMS_RECEIVE,
	TERMS_REQUEST,
	TERMS_REQUEST_FAILURE,
	TERMS_REQUEST_SUCCESS,
	SERIALIZE
} from 'state/action-types';
import reducer, {
	items,
	queries,
	queriesLastPage,
	queryRequests
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
			'queriesLastPage',
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
				2916284: {
					categories: {
						'{"search":"ribs"}': true
					}
				}
			} );
		} );

		it( 'should accumulate queries', () => {
			const original = deepFreeze( {
				2916284: {
					categories: {
						'{"search":"ribs"}': true
					}
				}
			} );

			const state = queryRequests( original, {
				type: TERMS_REQUEST,
				siteId: 2916284,
				query: { search: 'AND Chicken' },
				taxonomy: 'categories'
			} );

			expect( state ).to.eql( {
				2916284: {
					categories: {
						'{"search":"ribs"}': true,
						'{"search":"and chicken"}': true
					}
				}
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
				2916284: {
					categories: {
						'{"search":"ribs"}': false
					}
				}
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
				2916284: {
					categories: {
						'{"search":"ribs"}': false
					}
				}
			} );
		} );

		it( 'should never persist state', () => {
			const original = deepFreeze( {
				2916284: {
					categories: {
						'{"search":"ribs"}': false
					}
				}
			} );

			const state = queryRequests( original, { type: SERIALIZE } );

			expect( state ).to.eql( {} );
		} );

		it( 'should never load persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					categories: {
						'{"search":"ribs"}': false
					}
				}
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
				type: TERMS_RECEIVE,
				siteId: 2916284,
				query: { search: 'Ribs' },
				found: 2,
				terms: testTerms,
				taxonomy: 'categories'
			} );

			expect( state ).to.eql( {
				2916284: {
					categories: {
						'{"search":"ribs"}': [ 111, 123 ]
					}
				}
			} );
		} );

		it( 'should ignore actions without a query object', () => {
			const original = deepFreeze( {
				2916284: {
					categories: {
						'{"search":"ribs"}': [ 111 ]
					}
				}
			} );

			const state = queries( original, {
				type: TERMS_RECEIVE,
				siteId: 2916284,
				found: 1,
				terms: [ { ID: 7878, name: 'Kentucky Fried Chicken' } ],
				taxonomy: 'categories'
			} );

			expect( state ).to.eql( {
				2916284: {
					categories: {
						'{"search":"ribs"}': [ 111 ]
					}
				}
			} );
		} );

		it( 'should accumulate query request success', () => {
			const original = deepFreeze( {
				2916284: {
					categories: {
						'{"search":"ribs"}': [ 111 ]
					}
				}
			} );
			const state = queries( original, {
				type: TERMS_RECEIVE,
				siteId: 2916284,
				query: { search: 'And Chicken' },
				found: 1,
				terms: [ { ID: 777, name: 'Noms' } ],
				taxonomy: 'categories'
			} );

			expect( state ).to.eql( {
				2916284: {
					categories: {
						'{"search":"ribs"}': [ 111 ],
						'{"search":"and chicken"}': [ 777 ]
					}
				}
			} );
		} );

		it( 'should persist state', () => {
			const original = deepFreeze( {
				2916284: {
					categories: {
						'{"search":"ribs"}': [ 111 ]
					}
				}
			} );

			const state = queries( original, { type: SERIALIZE } );

			expect( state ).to.eql( {
				2916284: {
					categories: {
						'{"search":"ribs"}': [ 111 ]
					}
				}
			} );
		} );

		it( 'should load persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					categories: {
						'{"search":"ribs"}': [ 111 ]
					}
				}
			} );

			const state = queries( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {
				2916284: {
					categories: {
						'{"search":"ribs"}': [ 111 ]
					}
				}
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

	describe( '#queriesLastPage()', () => {
		it( 'should default to an empty object', () => {
			const state = queriesLastPage( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track term query request success last page', () => {
			const state = queriesLastPage( undefined, {
				type: TERMS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: '', number: 1 },
				found: 2,
				terms: [ { ID: 321, name: 'Ribs' } ],
				taxonomy: 'category'
			} );

			expect( state ).to.eql( {
				2916284: {
					category: {
						'{"number":1}': 2
					}
				}
			} );
		} );

		it( 'should track last page regardless of page param', () => {
			const state = queriesLastPage( undefined, {
				type: TERMS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: '', number: 1, page: 2 },
				found: 2,
				taxonomy: 'category',
				terms: [ { ID: 321, name: 'Ribs' } ]
			} );

			expect( state ).to.eql( {
				2916284: {
					category: {
						'{"number":1}': 2
					}
				}
			} );
		} );

		it( 'should consider no results as having last page of 1', () => {
			const state = queriesLastPage( undefined, {
				type: TERMS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'none', number: 1 },
				found: 0,
				terms: [],
				taxonomy: 'category'
			} );

			expect( state ).to.eql( {
				2916284: {
					category: {
						'{"search":"none","number":1}': 1
					}
				}
			} );
		} );

		it( 'should accumulate term request success', () => {
			const original = deepFreeze( {
				2916284: {
					category: {
						'{"search":"none","number":1}': 1
					}
				}
			} );
			const state = queriesLastPage( original, {
				type: TERMS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Ribs' },
				found: 1,
				terms: [ { ID: 123, name: 'Ribs' } ],
				taxonomy: 'category'
			} );

			expect( state ).to.eql( {
				2916284: {
					category: {
						'{"search":"none","number":1}': 1,
						'{"search":"ribs"}': 1
					}
				}
			} );
		} );

		it( 'never persists state', () => {
			const original = deepFreeze( {
				2916284: {
					category: {
						'{"search":"none","number":1}': 1
					}
				}
			} );
			const state = queriesLastPage( original, { type: SERIALIZE } );
			expect( state ).to.eql( {} );
		} );

		it( 'never loads persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					category: {
						'{"search":"none","number":1}': 1
					}
				}
			} );
			const state = queriesLastPage( original, { type: DESERIALIZE } );
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

		it( 'should add a temporary term by taxonomy', () => {
			const original = deepFreeze( {
				2916284: {
					'jetpack-portfolio': {
						724: {
							ID: 724,
							name: 'Ribs',
							slug: 'ribs'
						}
					}
				}
			} );

			const state = items( original, {
				type: TERMS_ADD_REQUEST,
				siteId: 2916284,
				taxonomy: 'jetpack-portfolio',
				temporaryId: 'temporary-1',
				term: {
					name: 'And Chicken'
				}
			} );

			expect( state ).to.eql( {
				2916284: {
					'jetpack-portfolio': {
						724: {
							ID: 724,
							name: 'Ribs',
							slug: 'ribs'
						},
						'temporary-1': {
							name: 'And Chicken'
						}
					}
				}
			} );
		} );

		it( 'should remove temporary term and add permanent term', () => {
			const original = deepFreeze( {
				2916284: {
					'jetpack-portfolio': {
						724: {
							ID: 724,
							name: 'Ribs',
							slug: 'ribs'
						},
						'temporary-1': {
							name: 'And Chicken'
						}
					}
				}
			} );

			const state = items( original, {
				type: TERMS_ADD_REQUEST_SUCCESS,
				siteId: 2916284,
				taxonomy: 'jetpack-portfolio',
				temporaryId: 'temporary-1',
				term: {
					ID: 8976,
					name: 'And Chicken',
					slug: 'and-chicken'
				}
			} );

			expect( state ).to.eql( {
				2916284: {
					'jetpack-portfolio': {
						724: {
							ID: 724,
							name: 'Ribs',
							slug: 'ribs'
						},
						8976: {
							ID: 8976,
							name: 'And Chicken',
							slug: 'and-chicken'
						}
					}
				}
			} );
		} );

		it( 'should remove temporary term on add failure', () => {
			const original = deepFreeze( {
				2916284: {
					'jetpack-portfolio': {
						724: {
							ID: 724,
							name: 'Ribs',
							slug: 'ribs'
						},
						'temporary-1': {
							name: 'And Chicken'
						}
					}
				}
			} );

			const state = items( original, {
				type: TERMS_ADD_REQUEST_FAILURE,
				siteId: 2916284,
				taxonomy: 'jetpack-portfolio',
				temporaryId: 'temporary-1',
				error: 'FAIL'
			} );

			expect( state ).to.eql( {
				2916284: {
					'jetpack-portfolio': {
						724: {
							ID: 724,
							name: 'Ribs',
							slug: 'ribs'
						}
					}
				}
			} );
		} );
	} );
} );
