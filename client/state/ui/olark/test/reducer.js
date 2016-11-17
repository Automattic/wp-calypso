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
	OLARK_TIMEOUT,
	OLARK_OPERATORS_AVAILABLE,
	OLARK_OPERATORS_AWAY,
	OLARK_CONFIG_FETCH,
	OLARK_CONFIG_RECEIVE,
} from 'state/action-types';
import {
	STATUS_READY,
	STATUS_TIMEOUT,
	OPERATOR_STATUS_AVAILABLE,
	OPERATOR_STATUS_AWAY
} from '../constants';
import reducer, { config, status, requesting, operatorStatus } from '../reducer';

describe( 'reducer', () => {
	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'config',
			'status',
			'requesting',
			'operatorStatus'
		] );
	} );

	describe( '#config()', () => {
		it( 'should default to empty object', () => {
			const state = config( undefined, {} );
			expect( state ).to.eql( {} );
		} );
		it( 'should track when we request an olark configuration', () => {
			const state = config( undefined, {
				type: OLARK_CONFIG_FETCH,
				context: 'TEST',
			} );
			expect( state ).to.eql( { TEST: { isFetching: true } } );
		} );
		it( 'should track when we receive an olark configuration', () => {
			const options = {
				group: 'testGroup',
			};
			const state = config( undefined, {
				type: OLARK_CONFIG_RECEIVE,
				context: 'TEST',
				options,
			} );
			expect( state ).to.eql( { TEST: { isFetching: false, options } } );
		} );
	} );

	describe( '#operatorStatus()', () => {
		it( 'should default to away', () => {
			const state = operatorStatus( undefined, {} );
			expect( state ).to.equal( OPERATOR_STATUS_AWAY );
		} );
		it( 'should update on available', () => {
			const state = operatorStatus( undefined, {
				type: OLARK_OPERATORS_AVAILABLE
			} );
			expect( state ).to.equal( OPERATOR_STATUS_AVAILABLE );
		} );
		it( 'should update on away', () => {
			const state = operatorStatus( undefined, {
				type: OLARK_OPERATORS_AWAY
			} );
			expect( state ).to.equal( OPERATOR_STATUS_AWAY );
		} );
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
