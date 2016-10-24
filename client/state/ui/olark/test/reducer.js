/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	OLARK_READY,
	OLARK_REQUEST,
	OLARK_TIMEOUT
} from 'state/action-types';
import {
	STATUS_READY,
	STATUS_TIMEOUT
} from '../constants';
import reducer, { status, requesting } from '../reducer';

describe( 'reducer', () => {
	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'status',
			'requesting'
		] );
	} );

	describe( '#status()', () => {
		it( 'should default to null', () => {
			const state = status( undefined, {} );
			expect( state ).to.equal( null );
		} );
		it( 'should update status on ready', () => {
			const state = status( undefined, {
				type: OLARK_READY
			} );
			expect( state ).to.equal( STATUS_READY );
		} );
		it( 'should update status on timeout', () => {
			const state = status( undefined, {
				type: OLARK_TIMEOUT
			} );
			expect( state ).to.equal( STATUS_TIMEOUT );
		} );
		it( 'should be ready if ready is fired after timeout', () => {
			const state = status( STATUS_TIMEOUT, {
				type: OLARK_READY
			} );
			expect( state ).to.equal( STATUS_READY );
		} );
		it( 'should not timeout if already ready', () => {
			const state = status( STATUS_READY, {
				type: OLARK_TIMEOUT
			} );
			expect( state ).to.equal( STATUS_READY );
		} );
	} );

	describe( '#requesting()', () => {
		it( 'should default to false', () => {
			const state = requesting( undefined, {} );
			expect( state ).to.equal( false );
		} );
		it( 'should track when we request olark state', () => {
			const state = requesting( undefined, {
				type: OLARK_REQUEST
			} );
			expect( state ).to.equal( true );
		} );
		it( 'should track request state when olark times out', () => {
			const state = requesting( undefined, {
				type: OLARK_TIMEOUT
			} );
			expect( state ).to.equal( false );
		} );
		it( 'should track request state when olark is ready', () => {
			const state = requesting( undefined, {
				type: OLARK_READY
			} );
			expect( state ).to.equal( false );
		} );
	} );
} );
