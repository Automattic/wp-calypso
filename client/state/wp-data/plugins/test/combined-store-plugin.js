/** @format */

/**
 * External dependencies
 */
import { createStore } from 'redux';
import { createRegistry } from '@wordpress/data';

/**
 * Internal dependencies
 */
import internalsPlugin from '../internals-plugin';
import combinedStorePlugin from '../combined-store-plugin';
import customStorePlugin from '../custom-store-plugin';

describe( 'combined-store-plugin', () => {
	let registry;

	beforeEach( () => {
		registry = createRegistry();
		registry = registry.use( internalsPlugin );
		registry = registry.use( customStorePlugin );
		registry = registry.use( combinedStorePlugin );
	} );

	describe( 'registerStore', () => {
		const initialReducers = {
			baker: () => ( { baguette: 7 } ),
		};

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

		let reduxStore;

		beforeEach( () => {
			reduxStore = createStore( () => ( {} ) );
		} );

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

		it( 'should register a parent store', () => {
			const store = registry.registerParentStore(
				'city',
				{ reducers: initialReducers },
				reduxStore
			);

			expect( store.getState() ).toEqual( { baker: { baguette: 7 } } );
		} );

		it( 'should register a child store to a parent', () => {
			registry.registerParentStore( 'city', { reducers: initialReducers }, reduxStore );

			const options = {
				parent: 'city',
				reducers: {
					grocer: reducer,
				},
				selectors: {
					getPrice: ( state, produce ) => state.grocer[ produce ],
				},
				actions,
			};

			const listener = jest.fn();
			const store = registry.registerChildStore( 'city/grocer', options );
			const unsubscribe = registry.subscribe( listener );

			expect( store.getState() ).toEqual( {
				baker: { baguette: 7 },
				grocer: { carrots: 6, potatoes: 4 },
			} );
			expect( registry.dispatch( 'city/grocer' ) ).toHaveProperty( 'startSale' );
			expect( registry.select( 'city/grocer' ) ).toHaveProperty( 'getPrice' );
			expect( registry.select( 'city/grocer' ).getPrice( 'carrots' ) ).toBe( 6 );
			expect( registry.select( 'city/grocer' ).getPrice( 'potatoes' ) ).toBe( 4 );

			registry.dispatch( 'city/grocer' ).startSale( 'carrots' );
			expect( listener ).toHaveBeenCalledTimes( 1 );
			expect( registry.select( 'city/grocer' ).getPrice( 'carrots' ) ).toBe( 3 );
			expect( registry.select( 'city/grocer' ).getPrice( 'potatoes' ) ).toBe( 4 );

			unsubscribe();
		} );

		it( 'should throw error upon reducer key collision', () => {
			registry.registerParentStore( 'city', { reducers: initialReducers }, reduxStore );

			const options = {
				parent: 'city',
				reducers: { baker: () => {} },
			};

			const registerBaker = () => registry.registerChildStore( 'city/baker', options );

			expect( registerBaker ).toThrow( TypeError );
		} );
	} );
} );
