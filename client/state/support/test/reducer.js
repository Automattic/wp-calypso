/** @format */

/**
 * Internal dependencies
 */
import reducer, { SESSION_NONE, SESSION_ACTIVE, SESSION_EXPIRED } from '../reducer';
import { SUPPORT_SESSION_TRANSITION } from 'state/action-types';

describe( 'reducer', () => {
	describe( '#isSupportSession', () => {
		test( 'defaults to no session', () => {
			const state = reducer( undefined, { type: '@@INIT' } );
			expect( state ).toEqual( SESSION_NONE );
		} );

		test( 'activated from no session', () => {
			const state = reducer( SESSION_NONE, {
				type: SUPPORT_SESSION_TRANSITION,
				nextState: SESSION_ACTIVE,
			} );
			expect( state ).toEqual( SESSION_ACTIVE );
		} );

		test( 'expired from active session', () => {
			const state = reducer( SESSION_ACTIVE, {
				type: SUPPORT_SESSION_TRANSITION,
				nextState: SESSION_EXPIRED,
			} );
			expect( state ).toEqual( SESSION_EXPIRED );
		} );
	} );
} );
