/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import {
	registerStore,
	registerReducer,
	registerSelectors,
	dispatch,
	select,
} from '@wordpress/data';

import { createBlock, registerBlockType } from '@wordpress/blocks';

describe( 'Gutenberg @wordress/data package', () => {
	describe( 'registerStore', () => {
		it( 'should be shorthand for reducer, actions, selectors registration', () => {
			const DEFAULT_STATE = {
				prices: { shirt: 5 },
				discountPercent: 0,
			};

			const store = registerStore( 'my-shop', {
				reducer( state = DEFAULT_STATE, action ) {
					switch ( action.type ) {
						case 'SET_PRICE':
							return {
								...state,
								prices: {
									...state.prices,
									[ action.item ]: action.price,
								},
							};

						case 'START_SALE':
							return {
								...state,
								discountPercent: action.discountPercent,
							};
					}

					return state;
				},

				actions: {
					setPrice( item, price ) {
						return {
							type: 'SET_PRICE',
							item,
							price,
						};
					},
					startSale( discountPercent ) {
						return {
							type: 'START_SALE',
							discountPercent,
						};
					},
				},

				selectors: {
					getPrice( state, item ) {
						const { prices, discountPercent } = state;
						const price = prices[ item ];

						return price * ( 1 - 0.01 * discountPercent );
					},
				},
			} );

			expect( store.getState() ).toEqual( DEFAULT_STATE );
			expect( select( 'my-shop' ) ).toHaveProperty( 'getPrice' );
			expect( select( 'my-shop' ).getPrice( 'shirt' ) ).toEqual( 5 );
			dispatch( 'my-shop' ).setPrice( 'shirt', 10 );
			expect( select( 'my-shop' ).getPrice( 'shirt' ) ).toEqual( 10 );
			dispatch( 'my-shop' ).startSale( 20 );
			expect( select( 'my-shop' ).getPrice( 'shirt' ) ).toEqual( 8 );
		} );
	} );

	describe( 'registerReducer', () => {
		it( 'Should append reducers to the state', () => {
			const reducer = () => 'tea';

			const store = registerReducer( 'reducer', reducer );
			expect( store.getState() ).toEqual( 'tea' );
		} );
	} );

	describe( 'select', () => {
		it( 'registers multiple selectors to the public API', () => {
			const store = registerReducer( 'reducer', () => {} );
			const selector = jest.fn( () => 'test-result' );

			registerSelectors( 'reducer', { selector } );

			expect( select( 'reducer' ).selector() ).toEqual( 'test-result' );
			expect( selector ).toBeCalledWith( store.getState() );
		} );
	} );
} );

describe( 'Gutenberg @wordress/blocks package', () => {
	describe( 'createBlock', () => {
		it( 'should create a block given its blockType, attributes, inner blocks', () => {
			registerBlockType( 'core/test-block', {
				attributes: {
					align: {
						type: 'string',
					},
					includesDefault: {
						type: 'boolean',
						default: true,
					},
					includesFalseyDefault: {
						type: 'number',
						default: 0,
					},
				},
				save: noop,
				category: 'common',
				title: 'test block',
			} );

			const block = createBlock( 'core/test-block', { align: 'left' }, [
				createBlock( 'core/test-block' ),
			] );

			expect( block.name ).toEqual( 'core/test-block' );
			expect( block.attributes ).toEqual( {
				includesDefault: true,
				includesFalseyDefault: 0,
				align: 'left',
			} );
			expect( block.isValid ).toBe( true );
			expect( block.innerBlocks ).toHaveLength( 1 );
			expect( block.innerBlocks[ 0 ].name ).toBe( 'core/test-block' );
			expect( typeof block.clientId ).toBe( 'string' );
		} );
	} );
} );
