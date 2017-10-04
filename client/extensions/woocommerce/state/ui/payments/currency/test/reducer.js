/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { changeCurrency } from '../actions';

const siteId = 123;
const state = {};

describe( 'reducer', () => {
	describe( 'changeCurrency', () => {
		it( 'should set currency in state', () => {
			const newState = reducer( state, changeCurrency( siteId, { currency: 'USD' } ) );
			expect( newState ).to.deep.equal( { currency: 'USD' } );
		} );
	} );
} );
