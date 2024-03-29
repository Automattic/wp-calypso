import deepFreeze from 'deep-freeze';
import TermQueryManager from 'calypso/lib/query-manager/term';
import {
	TERM_REMOVE,
	TERMS_RECEIVE,
	TERMS_REQUEST,
	TERMS_REQUEST_FAILURE,
	TERMS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import reducer, { queries, queryRequests } from '../reducer';

/**
 * Test Data
 */
const testTerms = [
	{
		ID: 111,
		name: 'Chicken',
		slug: 'chicken',
		description: 'colonel sanders',
		post_count: 1,
		parent: 0,
	},
	{
		ID: 123,
		name: 'Ribs',
		slug: 'ribs',
		description: 'i want my baby back * 3 ribs',
		post_count: 100,
		parent: 0,
	},
];

describe( 'reducer', () => {
	jest.spyOn( console, 'warn' ).mockImplementation();

	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [ 'queries', 'queryRequests' ] )
		);
	} );

	describe( 'queryRequests()', () => {
		test( 'should default to an empty object', () => {
			const state = queryRequests( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should track term query request fetching', () => {
			const state = queryRequests( undefined, {
				type: TERMS_REQUEST,
				siteId: 2916284,
				query: { search: 'Ribs' },
				taxonomy: 'category',
			} );

			expect( state ).toEqual( {
				2916284: {
					category: {
						'{"search":"ribs"}': true,
					},
				},
			} );
		} );

		test( 'should accumulate queries', () => {
			const original = deepFreeze( {
				2916284: {
					category: {
						'{"search":"ribs"}': true,
					},
				},
			} );

			const state = queryRequests( original, {
				type: TERMS_REQUEST,
				siteId: 2916284,
				query: { search: 'AND Chicken' },
				taxonomy: 'category',
			} );

			expect( state ).toEqual( {
				2916284: {
					category: {
						'{"search":"ribs"}': true,
						'{"search":"and chicken"}': true,
					},
				},
			} );
		} );

		test( 'should track term query request success', () => {
			const state = queryRequests( undefined, {
				type: TERMS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Ribs' },
				found: testTerms.length,
				terms: testTerms,
				taxonomy: 'category',
			} );

			expect( state ).toEqual( {
				2916284: {
					category: {
						'{"search":"ribs"}': false,
					},
				},
			} );
		} );

		test( 'should track term query request failure', () => {
			const state = queryRequests( undefined, {
				type: TERMS_REQUEST_FAILURE,
				siteId: 2916284,
				query: { search: 'Ribs' },
				error: new Error(),
				taxonomy: 'category',
			} );

			expect( state ).toEqual( {
				2916284: {
					category: {
						'{"search":"ribs"}': false,
					},
				},
			} );
		} );
	} );

	describe( 'queries()', () => {
		test( 'should default to an empty object', () => {
			const state = queries( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should track term query request success', () => {
			const query = { search: 'i' };
			const state = queries( undefined, {
				type: TERMS_RECEIVE,
				siteId: 2916284,
				found: 2,
				terms: testTerms,
				taxonomy: 'category',
				query,
			} );

			expect( Object.keys( state ) ).toEqual( expect.arrayContaining( [ '2916284' ] ) );
			expect( Object.keys( state[ 2916284 ] ) ).toContain( 'category' );
			expect( state[ 2916284 ].category ).toBeInstanceOf( TermQueryManager );
			expect( state[ 2916284 ].category.getItems( query ) ).toEqual( testTerms );
			expect( state[ 2916284 ].category.getFound( query ) ).toEqual( 2 );
		} );

		test( 'should track items even if no query is specified', () => {
			const state = queries( undefined, {
				type: TERMS_RECEIVE,
				siteId: 2916284,
				terms: testTerms,
				taxonomy: 'category',
			} );

			expect( Object.keys( state ) ).toEqual( expect.arrayContaining( [ '2916284' ] ) );
			expect( Object.keys( state[ 2916284 ] ) ).toContain( 'category' );
			expect( state[ 2916284 ].category ).toBeInstanceOf( TermQueryManager );
			expect( state[ 2916284 ].category.getItems() ).toEqual( testTerms );
		} );

		test( 'should return the same state if no changes to received items', () => {
			const action = {
				type: TERMS_RECEIVE,
				siteId: 2916284,
				found: 2,
				terms: testTerms,
				taxonomy: 'category',
				query: { search: 'i' },
			};

			const original = deepFreeze( queries( undefined, action ) );
			const state = queries( original, action );

			expect( state ).toEqual( original );
		} );

		test( 'should accumulate query request success', () => {
			const original = deepFreeze(
				queries( undefined, {
					type: TERMS_RECEIVE,
					siteId: 2916284,
					found: 2,
					terms: testTerms,
					taxonomy: 'category',
					query: { search: 'i' },
				} )
			);

			const state = queries( original, {
				type: TERMS_RECEIVE,
				siteId: 2916284,
				query: { search: 'nom' },
				found: 1,
				terms: [ { ID: 777, name: 'Noms' } ],
				taxonomy: 'post_tag',
			} );

			expect( Object.keys( state ) ).toEqual( expect.arrayContaining( [ '2916284' ] ) );
			expect( Object.keys( state[ 2916284 ] ) ).toEqual(
				expect.arrayContaining( [ 'category', 'post_tag' ] )
			);
		} );

		test( 'should omit removed term', () => {
			const original = deepFreeze(
				queries( undefined, {
					type: TERMS_RECEIVE,
					siteId: 2916284,
					terms: testTerms,
					taxonomy: 'category',
				} )
			);

			const state = queries( original, {
				type: TERM_REMOVE,
				siteId: 2916284,
				taxonomy: 'category',
				termId: testTerms[ 0 ].ID,
			} );

			expect( Object.keys( state ) ).toEqual( expect.arrayContaining( [ '2916284' ] ) );
			expect( Object.keys( state[ 2916284 ] ) ).toContain( 'category' );
			expect( state[ 2916284 ].category.getItems() ).toHaveLength( testTerms.length - 1 );
			expect( state[ 2916284 ].category.getItem( testTerms[ 0 ].ID ) ).toBeUndefined();
		} );

		test( 'should persist state', () => {
			const original = deepFreeze(
				queries( undefined, {
					type: TERMS_RECEIVE,
					siteId: 2916284,
					found: 2,
					terms: testTerms,
					taxonomy: 'category',
					query: { search: 'i' },
				} )
			);

			const state = serialize( queries, original );

			expect( Object.keys( state ) ).toEqual( expect.arrayContaining( [ '2916284' ] ) );
			expect( Object.keys( state[ 2916284 ] ) ).toEqual( expect.arrayContaining( [ 'category' ] ) );
			expect( Object.keys( state[ 2916284 ].category ) ).toEqual(
				expect.arrayContaining( [ 'data', 'options' ] )
			);
		} );

		test( 'should load persisted state', () => {
			const original = deepFreeze(
				queries( undefined, {
					type: TERMS_RECEIVE,
					siteId: 2916284,
					found: 2,
					terms: testTerms,
					taxonomy: 'category',
					query: { search: 'i' },
				} )
			);

			const serialized = serialize( queries, original );
			const state = deserialize( queries, serialized );

			expect( state ).toEqual( original );
		} );

		test( 'should not load invalid persisted state', () => {
			const state = deserialize( queries, {
				2916284: {
					category: '{~!--BROKEN',
				},
			} );

			expect( state ).toEqual( {} );
		} );
	} );
} );
