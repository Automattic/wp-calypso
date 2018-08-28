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

import { parse } from '@wordpress/block-serialization-spec-parser';

import apiFetch from '@wordpress/api-fetch';

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

describe( 'block-serialization-spec-parser', () => {
	// Try test from https://github.com/WordPress/gutenberg/blob/54990c0f77294e6603cc4e0aa957c0679c1bf242/packages/block-serialization-spec-parser/test/index.js
	test( 'parse() works properly', () => {
		const result = parse( '<!-- wp:core/more --><!--more--><!-- /wp:core/more -->' );

		expect( result ).toMatchInlineSnapshot( `
Array [
  Object {
    "attrs": null,
    "blockName": "core/more",
    "innerBlocks": Array [],
    "innerHTML": "<!--more-->",
  },
]
` );
	} );
} );

describe( 'Gutenberg @wordress/api-fetch package', () => {
	// Try tests from https://github.com/WordPress/gutenberg/blob/54990c0f77294e6603cc4e0aa957c0679c1bf242/packages/api-fetch/src/test/index.js
	describe( 'apiFetch', () => {
		const originalFetch = window.fetch;
		beforeAll( () => {
			window.fetch = jest.fn();
		} );

		afterAll( () => {
			window.fetch = originalFetch;
		} );

		it( 'should call the API propertly', () => {
			window.fetch.mockReturnValue(
				Promise.resolve( {
					status: 200,
					json() {
						return Promise.resolve( { message: 'ok' } );
					},
				} )
			);

			return apiFetch( { path: '/random' } ).then( body => {
				expect( body ).toEqual( { message: 'ok' } );
			} );
		} );

		it( 'should return the error message properly', () => {
			window.fetch.mockReturnValue(
				Promise.resolve( {
					status: 400,
					json() {
						return Promise.resolve( {
							code: 'bad_request',
							message: 'Bad Request',
						} );
					},
					clone() {
						return this;
					},
				} )
			);

			return apiFetch( { path: '/random' } ).catch( body => {
				expect( body ).toEqual( {
					code: 'bad_request',
					message: 'Bad Request',
				} );
			} );
		} );

		it( 'should return invalid JSON error if no json response', () => {
			window.fetch.mockReturnValue(
				Promise.resolve( {
					status: 200,
				} )
			);

			return apiFetch( { path: '/random' } ).catch( body => {
				expect( body ).toEqual( {
					code: 'invalid_json',
					message: 'The response is not a valid JSON response.',
				} );
			} );
		} );

		it( 'should return invalid JSON error if response is not valid', () => {
			window.fetch.mockReturnValue(
				Promise.resolve( {
					status: 200,
					json() {
						return Promise.reject();
					},
				} )
			);

			return apiFetch( { path: '/random' } ).catch( body => {
				expect( body ).toEqual( {
					code: 'invalid_json',
					message: 'The response is not a valid JSON response.',
				} );
			} );
		} );

		it( 'should not try to parse the response', () => {
			window.fetch.mockReturnValue(
				Promise.resolve( {
					status: 200,
				} )
			);

			return apiFetch( { path: '/random', parse: false } ).then( response => {
				expect( response ).toEqual( {
					status: 200,
				} );
			} );
		} );

		it( 'should not try to parse the error', () => {
			window.fetch.mockReturnValue(
				Promise.resolve( {
					status: 400,
				} )
			);

			return apiFetch( { path: '/random', parse: false } ).catch( response => {
				expect( response ).toEqual( {
					status: 400,
				} );
			} );
		} );
	} );
} );
