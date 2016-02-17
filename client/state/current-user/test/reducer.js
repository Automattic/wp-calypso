/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { CURRENT_USER_ID_SET, DESERIALIZE, SERIALIZE } from 'state/action-types';
import { id } from '../reducer';

describe( 'reducer', () => {
	describe( '#id()', () => {
		it( 'should default to null', () => {
			const state = id( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should set the current user ID', () => {
			const state = id( null, {
				type: CURRENT_USER_ID_SET,
				userId: 73705554
			} );

			expect( state ).to.equal( 73705554 );
		} );

		describe( 'persistence', () => {
			before( () => {
				sinon.stub( console, 'warn' );
			} );

			after( () => {
				console.warn.restore();
			} );

			it( 'should validate ID is positive', () => {
				const state = id( -1, {
					type: DESERIALIZE
				} );
				expect( state ).to.equal( null );
			} );
			it( 'should validate ID is a number', () => {
				const state = id( 'foobar', {
					type: DESERIALIZE
				} );
				expect( state ).to.equal( null );
			} );
			it( 'returns valid ID', () => {
				const state = id( 73705554, {
					type: DESERIALIZE
				} );
				expect( state ).to.equal( 73705554 );
			} );
			it( 'will SERIALIZE current user', () => {
				const state = id( 73705554, {
					type: SERIALIZE
				} );
				expect( state ).to.equal( 73705554 );
			} );
		} );
	} );
} );
