/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { IMMEDIATE_LOGIN_SAVE_STATUS } from 'state/action-types';

describe( 'immediate-login/reducer', () => {
	describe( 'reducer', () => {
		test( 'should return initialState for DESERIALIZE', () => {
			const initialState = reducer( null, { type: 'DESERIALIZE' } );
			expect( initialState.used ).toEqual( false );
			expect( initialState.reason ).toEqual( null );
		} );

		test( 'should return correctly updated state [1]', () => {
			const updatedState = reducer( null, { type: IMMEDIATE_LOGIN_SAVE_STATUS } );
			expect( updatedState.used ).toEqual( true );
			expect( updatedState.reason ).toEqual( null );
		} );

		test( 'should return correctly updated state [2]', () => {
			const updatedState = reducer( null, {
				type: IMMEDIATE_LOGIN_SAVE_STATUS,
				reason: 'test reason',
			} );
			expect( updatedState.used ).toEqual( true );
			expect( updatedState.reason ).toEqual( 'test reason' );
		} );
	} );
} );
