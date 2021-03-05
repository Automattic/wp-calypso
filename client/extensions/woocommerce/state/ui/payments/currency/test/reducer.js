/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { changeCurrency } from '../actions';
import reducer from '../reducer';

const siteId = 123;
const state = {};

describe( 'reducer', () => {
	describe( 'changeCurrency', () => {
		test( 'should set currency in state', () => {
			const newState = reducer( state, changeCurrency( siteId, { currency: 'USD' } ) );
			expect( newState ).to.deep.equal( { currency: 'USD' } );
		} );
	} );
	describe( 'currencyUpdatedAction', () => {
		test( 'should clear edits upon successful update', () => {
			const action = {
				type: 'WOOCOMMERCE_CURRENCY_UPDATE_SUCCESS',
				siteId,
			};
			const newState = reducer( state, action );
			expect( newState ).to.equal( null );
		} );
	} );
} );
