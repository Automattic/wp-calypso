/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { olarkTimeout, requestOlark } from '../actions';
import {
	OLARK_REQUEST,
	OLARK_TIMEOUT,
	OLARK_OPERATORS_AVAILABLE,
	OLARK_OPERATORS_AWAY,
	OLARK_SET_AVAILABILITY,
} from 'state/action-types';
import { OLARK_TIMEOUT_MS } from '../constants';
import { useSandbox } from 'test/helpers/use-sinon';
import { useFakeTimers } from 'test/helpers/use-sinon';
import {
	setChatAvailability,
	operatorsAvailable,
	operatorsAway
} from '../actions';

describe( 'actions', () => {
	let sandbox, spy, clock;

	useSandbox( newSandbox => {
		sandbox = newSandbox;
		spy = sandbox.spy();
	} );

	useFakeTimers( fakeClock => {
		clock = fakeClock;
	} );

	describe( '#setChatAvailability()', () => {
		it( 'should return an action object', () => {
			const sampleAvailablityObject = { dummyData: true };
			const action = setChatAvailability( sampleAvailablityObject );
			expect( action ).to.eql( {
				type: OLARK_SET_AVAILABILITY,
				availability: sampleAvailablityObject
			} );
		} );
	} );

	describe( '#olarkTimeout()', () => {
		it( 'should return an action object', () => {
			const action = olarkTimeout();
			expect( action ).to.eql( {
				type: OLARK_TIMEOUT
			} );
		} );
	} );

	describe( '#operatorsAway()', () => {
		it( 'should return an action object', () => {
			const action = operatorsAway();
			expect( action ).to.eql( {
				type: OLARK_OPERATORS_AWAY
			} );
		} );
	} );

	describe( '#operatorsAvailable()', () => {
		it( 'should return an action object', () => {
			const action = operatorsAvailable();
			expect( action ).to.eql( {
				type: OLARK_OPERATORS_AVAILABLE
			} );
		} );
	} );

	describe( '#requestOlark()', () => {
		it( 'should dispatch request action when thunk triggered', () => {
			requestOlark()( spy );
			clock.tick( OLARK_TIMEOUT_MS );
			expect( spy ).to.have.been.calledWith( {
				type: OLARK_REQUEST
			} );
		} );

		it( 'should dispatch timeout action olark fails to load', () => {
			requestOlark()( spy );
			clock.tick( OLARK_TIMEOUT_MS );
			expect( spy ).to.have.been.calledWith( {
				type: OLARK_TIMEOUT
			} );
		} );
	} );
} );
