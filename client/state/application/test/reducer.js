/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { CONNECTION_LOST, CONNECTION_RESTORED } from 'state/action-types';
import { connectionState } from '../reducer';

describe( 'state/application reducer', () => {
	describe( '#connectionState()', () => {
		it( 'should default to CHECKING when no arguments provided', () => {
			expect( connectionState( undefined, {} ) ).to.equal( 'CHECKING' );
		} );

		it( 'should be ONLINE when action CONNECTION_RESTORED dispatched', () => {
			expect( connectionState( undefined, { type: CONNECTION_RESTORED  } ) ).to.equal( 'ONLINE' );
		} );

		it( 'should be OFFLINE when action CONNECTION_LOST dispatched', () => {
			expect( connectionState( undefined, { type: CONNECTION_LOST  } ) ).to.equal( 'OFFLINE' );
		} );

	} );
} );
