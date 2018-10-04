/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import {
	WOOCOMMERCE_WC_API_SUCCESS,
	WOOCOMMERCE_WC_API_UNAVAILABLE,
	WOOCOMMERCE_WC_API_UNKNOWN_ERROR,
} from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	test( 'should start with an initial state', () => {
		const state = reducer( undefined, { type: '%%INIT%%' } );

		expect( state.status ).to.equal( 'uninitialized' );
		expect( state.lastSuccessTime ).to.be.null;
		expect( state.lastErrorTime ).to.be.null;
	} );

	test( 'should show as available', () => {
		const actionTime = Date.now();
		const action = {
			type: WOOCOMMERCE_WC_API_SUCCESS,
			time: actionTime,
		};
		const state = reducer( undefined, action );

		expect( state.status ).to.equal( 'available' );
		expect( state.lastSuccessTime ).to.equal( actionTime );
	} );

	test( 'should show as unavailable', () => {
		const actionTime = Date.now();
		const action = {
			type: WOOCOMMERCE_WC_API_UNAVAILABLE,
			time: actionTime,
		};
		const state = reducer( undefined, action );

		expect( state.status ).to.equal( 'unavailable' );
		expect( state.lastErrorTime ).to.equal( actionTime );
	} );

	test( 'should show as unknown_error', () => {
		const actionTime = Date.now();
		const action = {
			type: WOOCOMMERCE_WC_API_UNKNOWN_ERROR,
			time: actionTime,
		};
		const state = reducer( undefined, action );

		expect( state.status ).to.equal( 'unknown_error' );
		expect( state.lastErrorTime ).to.equal( actionTime );
	} );
} );
