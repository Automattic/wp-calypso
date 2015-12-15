/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { SET_PAGE_STATE, RESET_PAGE_STATE } from 'state/action-types';
import page from '../reducer';

describe( 'reducer', () => {
	it( 'should default to an empty object', () => {
		const state = page( undefined, {} );

		expect( state ).to.be.eql( {} );
	} );

	it( 'should accumulate values on SET_PAGE_STATE', () => {
		const original = Object.freeze( {
			foo: 'bar'
		} );

		const state = page( original, {
			type: SET_PAGE_STATE,
			key: 'baz',
			value: 'qux'
		} );

		expect( state ).to.eql( {
			foo: 'bar',
			baz: 'qux'
		} );
	} );

	it( 'should reset to an empty object on RESET_PAGE_STATE', () => {
		const original = Object.freeze( {
			foo: 'bar'
		} );

		const state = page( original, {
			type: RESET_PAGE_STATE
		} );

		expect( state ).to.eql( {} );
	} );
} );
