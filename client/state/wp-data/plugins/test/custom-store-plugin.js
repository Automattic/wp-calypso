/** @format */

/**
 * External dependencies
 */
import { createStore } from 'redux';
import { createRegistry } from '@wordpress/data';

/**
 * Internal dependencies
 */
import customStorePlugin from '../custom-store-plugin';
import internalsPlugin from '../internals-plugin';

describe( 'custom-store-plugin', () => {
	let registry;

	beforeEach( () => {
		registry = createRegistry();
		registry = registry.use( internalsPlugin );
		registry = registry.use( customStorePlugin );
	} );

	describe( 'registerStore', () => {
		const reducer = ( state = { carrots: 6, potatoes: 4 }, action ) => {
			switch ( action.type ) {
				case 'sale':
					return {
						...state,
						[ action.produce ]: state[ action.produce ] / 2,
					};
			}
			return state;
		};

		const selectors = {
			getPrice: ( state, produce ) => state[ produce ],
		};

		const actions = {
			startSale: produce => ( { type: 'sale', produce } ),
		};

		it( 'should register a normal store as usual', () => {
			const options = {
				reducer,
				selectors,
				actions,
			};

			const listener = jest.fn();

			const store = registry.registerStore( 'grocer', options );
			const unsubscribe = registry.subscribe( listener );

			expect( store.getState() ).toEqual( { carrots: 6, potatoes: 4 } );
			expect( registry.dispatch( 'grocer' ) ).toHaveProperty( 'startSale' );
			expect( registry.select( 'grocer' ) ).toHaveProperty( 'getPrice' );
			expect( registry.select( 'grocer' ).getPrice( 'carrots' ) ).toBe( 6 );
			expect( registry.select( 'grocer' ).getPrice( 'potatoes' ) ).toBe( 4 );

			registry.dispatch( 'grocer' ).startSale( 'carrots' );
			expect( listener ).toHaveBeenCalledTimes( 1 );
			expect( registry.select( 'grocer' ).getPrice( 'carrots' ) ).toBe( 3 );
			expect( registry.select( 'grocer' ).getPrice( 'potatoes' ) ).toBe( 4 );

			unsubscribe();

			registry.dispatch( 'grocer' ).startSale( 'potatoes' );
			expect( listener ).toHaveBeenCalledTimes( 1 );
			expect( registry.select( 'grocer' ).getPrice( 'carrots' ) ).toBe( 3 );
			expect( registry.select( 'grocer' ).getPrice( 'potatoes' ) ).toBe( 2 );
		} );

		it( 'should use a custom store if provided in options', () => {
			const reduxStore = createStore( reducer );

			const options = { selectors, actions };

			const listener = jest.fn();
			const store = registry.registerStore( 'grocer', options, reduxStore );
			const unsubscribe = registry.subscribe( listener );

			expect( store ).toEqual( reduxStore );
			expect( store.getState() ).toEqual( { carrots: 6, potatoes: 4 } );
			expect( registry.dispatch( 'grocer' ) ).toHaveProperty( 'startSale' );
			expect( registry.select( 'grocer' ) ).toHaveProperty( 'getPrice' );
			expect( registry.select( 'grocer' ).getPrice( 'carrots' ) ).toBe( 6 );
			expect( registry.select( 'grocer' ).getPrice( 'potatoes' ) ).toBe( 4 );

			registry.dispatch( 'grocer' ).startSale( 'carrots' );
			expect( listener ).toHaveBeenCalledTimes( 1 );
			expect( registry.select( 'grocer' ).getPrice( 'carrots' ) ).toBe( 3 );
			expect( registry.select( 'grocer' ).getPrice( 'potatoes' ) ).toBe( 4 );

			unsubscribe();

			registry.dispatch( 'grocer' ).startSale( 'potatoes' );
			expect( listener ).toHaveBeenCalledTimes( 1 );
			expect( registry.select( 'grocer' ).getPrice( 'carrots' ) ).toBe( 3 );
			expect( registry.select( 'grocer' ).getPrice( 'potatoes' ) ).toBe( 2 );
		} );

		it( 'should not subscribe to the same store more than once', () => {
			const reduxStore = createStore( reducer );

			const options = { selectors, actions };

			const listener = jest.fn();
			registry.registerStore( 'store1', options, reduxStore );
			const unsubscribe = registry.subscribe( listener );

			registry.registerStore( 'store2', options, reduxStore );

			registry.dispatch( 'store1' ).startSale( 'carrots' );
			expect( listener ).toHaveBeenCalledTimes( 1 );

			registry.dispatch( 'store2' ).startSale( 'carrots' );
			expect( listener ).toHaveBeenCalledTimes( 2 );

			unsubscribe();
			registry.dispatch( 'store1' ).startSale( 'carrots' );
			expect( listener ).toHaveBeenCalledTimes( 2 );
		} );
	} );
} );
