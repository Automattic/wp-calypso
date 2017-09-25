/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isSupportUser } from '../reducer';
import { SUPPORT_USER_ACTIVATE } from 'state/action-types';

describe( 'reducer', () => {
	describe( '#isSupportUser()', () => {
		it( 'should set to true after activate', () => {
			const state = isSupportUser( false, {
				type: SUPPORT_USER_ACTIVATE
			} );

			expect( state ).to.equal( true );
		} );
	} );
} );
