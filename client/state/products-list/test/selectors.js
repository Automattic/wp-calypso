/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import {
	PRODUCTS_LIST_RECEIVE,
	PRODUCTS_LIST_REQUEST,
} from 'state/action-types';
import {
	getProductsList,
	isProductsListFetching,
} from '../selectors';
import {
	guided_transfer,
} from './fixtures';

describe( 'selectors', () => {
	const initialState = {
		productsList: reducer( undefined, { type: 'INIT' } ),
	};

	describe( '#getProductsList', () => {
		it( 'should return the initial products list', () => (
			expect( getProductsList( initialState ) ).to.eql( {} )
		) );

		it( 'should return a hydrated products list', () => {
			const hydrated = {
				productsList: reducer( initialState.productsList, {
					type: PRODUCTS_LIST_RECEIVE,
					productsList: { guided_transfer },
				} )
			};

			expect( getProductsList( hydrated ) ).to.eql( { guided_transfer } );
		} );
	} );

	describe( '#isProductListFetching', () => {
		it( 'should return the initial state', () => (
			expect( isProductsListFetching( initialState ) ).to.be.false
		) );

		it( 'should return an updated state', () => {
			const updated = {
				productsList: reducer( initialState.productsList, {
					type: PRODUCTS_LIST_REQUEST,
				} ),
			};

			expect( isProductsListFetching( updated ) ).to.be.true;
		} );
	} );
} );
