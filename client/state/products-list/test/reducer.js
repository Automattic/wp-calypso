import deepFreeze from 'deep-freeze';
import {
	PRODUCTS_LIST_RECEIVE,
	PRODUCTS_LIST_REQUEST,
	PRODUCTS_LIST_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import reducer, { items, isFetching, type } from '../reducer';

describe( 'reducer', () => {
	jest.spyOn( console, 'warn' ).mockImplementation();

	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [ 'items', 'isFetching', 'type' ] )
		);
	} );

	describe( '#items()', () => {
		test( 'should default to empty object', () => {
			const state = items( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should store the product list received', () => {
			const productsList = {
				'business-bundle': {
					available: true,
					product_id: 1008,
					product_name: 'WordPress.com Business',
					product_slug: 'business-bundle',
					is_domain_registration: false,
					description: '',
					cost: 300,
					cost_display: '$300',
				},
			};

			const state = items(
				{},
				{
					type: PRODUCTS_LIST_RECEIVE,
					productsList,
				}
			);

			expect( state ).toEqual( productsList );
		} );

		describe( 'persistence', () => {
			test( 'persists state', () => {
				const original = deepFreeze( {
					'business-bundle': {
						available: true,
						product_id: 1008,
						product_name: 'WordPress.com Business',
						product_slug: 'business-bundle',
						is_domain_registration: false,
						description: '',
						cost: 300,
						cost_display: '$300',
					},
				} );
				const state = serialize( items, original );
				expect( state ).toEqual( original );
			} );

			test( 'loads valid persisted state', () => {
				const original = deepFreeze( {
					'business-bundle': {
						available: true,
						product_id: 1008,
						product_name: 'WordPress.com Business',
						product_slug: 'business-bundle',
						is_domain_registration: false,
						description: '',
						cost: 300,
						cost_display: '$300',
					},
				} );
				const state = deserialize( items, original );
				expect( state ).toEqual( original );
			} );

			test( 'loads default state when schema does not match', () => {
				const original = deepFreeze( {
					'business-bundle': {
						available: true,
						id: 1008,
						name: 'WordPress.com Business',
						slug: 'business-bundle',
					},
				} );
				const state = deserialize( items, original );
				expect( state ).toEqual( {} );
			} );
		} );
	} );

	describe( '#isFetching()', () => {
		test( 'should default to false', () => {
			const state = isFetching( undefined, {} );

			expect( state ).toEqual( false );
		} );

		test( 'should be true after a request begins', () => {
			const state = isFetching( false, { type: PRODUCTS_LIST_REQUEST } );
			expect( state ).toEqual( true );
		} );

		test( 'should be false when a request completes', () => {
			const state = isFetching( true, { type: PRODUCTS_LIST_RECEIVE } );
			expect( state ).toEqual( false );
		} );

		test( 'should be false when a request fails', () => {
			const state = isFetching( true, { type: PRODUCTS_LIST_REQUEST_FAILURE } );
			expect( state ).toEqual( false );
		} );
	} );

	describe( '#type()', () => {
		test( 'should default to null', () => {
			const state = type( undefined, {} );

			expect( state ).toBeNull();
		} );

		test( 'should store the received type', () => {
			const state = type( undefined, { type: PRODUCTS_LIST_RECEIVE, productsListType: 'all' } );
			expect( state ).toEqual( 'all' );
		} );

		describe( 'persistence', () => {
			test( 'persists state', () => {
				const original = deepFreeze( 'jetpack' );
				const state = serialize( type, original );
				expect( state ).toEqual( original );
			} );

			test( 'loads valid persisted state', () => {
				const original = deepFreeze( 'jetpack' );
				const state = deserialize( type, original );
				expect( state ).toEqual( original );
			} );

			test( 'loads default state when schema does not match', () => {
				const original = deepFreeze( 0 );
				const state = deserialize( type, original );
				expect( state ).toBeNull();
			} );
		} );
	} );
} );
