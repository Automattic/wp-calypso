/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	SUPPORT_USER_ACTIVATE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import {
	isSupportUser,
} from '../reducer';

describe( 'reducer', () => {
	describe( '#isSupportUser()', () => {
		it( 'should set to true after activate', () => {
			const state = isSupportUser( false, {
				type: SUPPORT_USER_ACTIVATE,
			} );

			expect( state ).to.equal( true );
		} );

		it( 'should never persist state', () => {
			const state = isSupportUser( true, {
				type: SERIALIZE
			} );
			expect( state ).to.equal( false );
		} );

		it( 'should never load persisted state', () => {
			const state = isSupportUser( true, {
				type: DESERIALIZE
			} );
			expect( state ).to.equal( false );
		} );
	} );
} );
