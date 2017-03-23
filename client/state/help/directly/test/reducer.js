/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	DIRECTLY_INITIALIZATION_START,
	DIRECTLY_INITIALIZATION_SUCCESS,
	DIRECTLY_INITIALIZATION_ERROR,
} from 'state/action-types';
import {
	STATUS_UNINITIALIZED,
	STATUS_INITIALIZING,
	STATUS_READY,
	STATUS_ERROR,
} from '../constants';
import reducer, {
	status,
} from '../reducer';

describe( 'reducer', () => {
	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'status',
		] );
	} );

	describe( '#status()', () => {
		it( 'should default to uninitialized state', () => {
			const state = status( undefined, {} );
			expect( state ).to.eql( STATUS_UNINITIALIZED );
		} );

		it( 'should mark when initialization starts', () => {
			const state = status( undefined, { type: DIRECTLY_INITIALIZATION_START } );
			expect( state ).to.eql( STATUS_INITIALIZING );
		} );

		it( 'should mark when initialization completes', () => {
			const state = status( undefined, { type: DIRECTLY_INITIALIZATION_SUCCESS } );
			expect( state ).to.eql( STATUS_READY );
		} );

		it( 'should mark when initialization fails', () => {
			const state = status( undefined, { type: DIRECTLY_INITIALIZATION_ERROR } );
			expect( state ).to.eql( STATUS_ERROR );
		} );
	} );
} );
