/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	STATUS_READY,
	STATUS_TIMEOUT,
	OPERATOR_STATUS_AVAILABLE,
	OPERATOR_STATUS_AWAY,
} from '../constants';
import reducer, { status, requesting, availability, operatorStatus } from '../reducer';
import {
	OLARK_READY,
	OLARK_REQUEST,
	OLARK_TIMEOUT,
	OLARK_OPERATORS_AVAILABLE,
	OLARK_OPERATORS_AWAY,
	OLARK_SET_AVAILABILITY,
} from 'client/state/action-types';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'status',
			'requesting',
			'availability',
			'operatorStatus',
		] );
	} );

	describe( '#availability()', () => {
		test( 'should default to empty object', () => {
			const state = availability( undefined, {} );
			expect( state ).to.eql( {} );
		} );
		test( 'should update on set chat availability event', () => {
			const sampleAvailabilityObject = { test: true };
			const state = availability( undefined, {
				type: OLARK_SET_AVAILABILITY,
				availability: sampleAvailabilityObject,
			} );
			expect( state ).to.eql( sampleAvailabilityObject );
		} );
	} );

	describe( '#operatorStatus()', () => {
		test( 'should default to away', () => {
			const state = operatorStatus( undefined, {} );
			expect( state ).to.equal( OPERATOR_STATUS_AWAY );
		} );
		test( 'should update on available', () => {
			const state = operatorStatus( undefined, {
				type: OLARK_OPERATORS_AVAILABLE,
			} );
			expect( state ).to.equal( OPERATOR_STATUS_AVAILABLE );
		} );
		test( 'should update on away', () => {
			const state = operatorStatus( undefined, {
				type: OLARK_OPERATORS_AWAY,
			} );
			expect( state ).to.equal( OPERATOR_STATUS_AWAY );
		} );
	} );

	describe( '#status()', () => {
		test( 'should default to null', () => {
			const state = status( undefined, {} );
			expect( state ).to.equal( null );
		} );
		test( 'should update status on ready', () => {
			const state = status( undefined, {
				type: OLARK_READY,
			} );
			expect( state ).to.equal( STATUS_READY );
		} );
		test( 'should update status on timeout', () => {
			const state = status( undefined, {
				type: OLARK_TIMEOUT,
			} );
			expect( state ).to.equal( STATUS_TIMEOUT );
		} );
		test( 'should be ready if ready is fired after timeout', () => {
			const state = status( STATUS_TIMEOUT, {
				type: OLARK_READY,
			} );
			expect( state ).to.equal( STATUS_READY );
		} );
		test( 'should not timeout if already ready', () => {
			const state = status( STATUS_READY, {
				type: OLARK_TIMEOUT,
			} );
			expect( state ).to.equal( STATUS_READY );
		} );
	} );

	describe( '#requesting()', () => {
		test( 'should default to false', () => {
			const state = requesting( undefined, {} );
			expect( state ).to.equal( false );
		} );
		test( 'should track when we request olark state', () => {
			const state = requesting( undefined, {
				type: OLARK_REQUEST,
			} );
			expect( state ).to.equal( true );
		} );
		test( 'should track request state when olark times out', () => {
			const state = requesting( undefined, {
				type: OLARK_TIMEOUT,
			} );
			expect( state ).to.equal( false );
		} );
		test( 'should track request state when olark is ready', () => {
			const state = requesting( undefined, {
				type: OLARK_READY,
			} );
			expect( state ).to.equal( false );
		} );
	} );
} );
