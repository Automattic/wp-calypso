/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { connectionState } from '../reducer';
import {
	CONNECTION_LOST,
	CONNECTION_RESTORED,
	SERIALIZE,
	DESERIALIZE,
} from 'calypso/state/action-types';

describe( 'state/application reducer', () => {
	describe( '#connectionState()', () => {
		test( 'should default to CHECKING when no arguments provided', () => {
			expect( connectionState( undefined, {} ) ).to.equal( 'CHECKING' );
		} );

		test( 'should be ONLINE when action CONNECTION_RESTORED dispatched', () => {
			expect( connectionState( undefined, { type: CONNECTION_RESTORED } ) ).to.equal( 'ONLINE' );
		} );

		test( 'should be OFFLINE when action CONNECTION_LOST dispatched', () => {
			expect( connectionState( undefined, { type: CONNECTION_LOST } ) ).to.equal( 'OFFLINE' );
		} );

		test( 'never persists online state', () => {
			const state = connectionState( 'ONLINE', { type: SERIALIZE } );
			expect( state ).to.be.undefined;
		} );

		test( 'never persists offline state', () => {
			const state = connectionState( 'OFFLINE', { type: SERIALIZE } );
			expect( state ).to.be.undefined;
		} );

		test( 'always uses initialState, even if given offline', () => {
			const state = connectionState( 'OFFLINE', { type: DESERIALIZE } );
			expect( state ).to.eql( 'CHECKING' );
		} );

		test( 'always uses initialState, even if given online', () => {
			const state = connectionState( 'ONLINE', { type: DESERIALIZE } );
			expect( state ).to.eql( 'CHECKING' );
		} );
	} );
} );
