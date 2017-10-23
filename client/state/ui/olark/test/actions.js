/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { olarkTimeout, requestOlark } from '../actions';
import { setChatAvailability, operatorsAvailable, operatorsAway } from '../actions';
import { OLARK_TIMEOUT_MS } from '../constants';
import {
	OLARK_REQUEST,
	OLARK_TIMEOUT,
	OLARK_OPERATORS_AVAILABLE,
	OLARK_OPERATORS_AWAY,
	OLARK_SET_AVAILABILITY,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';
import { useFakeTimers } from 'test/helpers/use-sinon';

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
		test( 'should return an action object', () => {
			const sampleAvailablityObject = { dummyData: true };
			const action = setChatAvailability( sampleAvailablityObject );
			expect( action ).to.eql( {
				type: OLARK_SET_AVAILABILITY,
				availability: sampleAvailablityObject,
			} );
		} );
	} );

	describe( '#olarkTimeout()', () => {
		test( 'should return an action object', () => {
			const action = olarkTimeout();
			expect( action ).to.eql( {
				type: OLARK_TIMEOUT,
			} );
		} );
	} );

	describe( '#operatorsAway()', () => {
		test( 'should return an action object', () => {
			const action = operatorsAway();
			expect( action ).to.eql( {
				type: OLARK_OPERATORS_AWAY,
			} );
		} );
	} );

	describe( '#operatorsAvailable()', () => {
		test( 'should return an action object', () => {
			const action = operatorsAvailable();
			expect( action ).to.eql( {
				type: OLARK_OPERATORS_AVAILABLE,
			} );
		} );
	} );

	describe( '#requestOlark()', () => {
		test( 'should dispatch request action when thunk triggered', () => {
			requestOlark()( spy );
			clock.tick( OLARK_TIMEOUT_MS );
			expect( spy ).to.have.been.calledWith( {
				type: OLARK_REQUEST,
			} );
		} );

		test( 'should dispatch timeout action olark fails to load', () => {
			requestOlark()( spy );
			clock.tick( OLARK_TIMEOUT_MS );
			expect( spy ).to.have.been.calledWith( {
				type: OLARK_TIMEOUT,
			} );
		} );
	} );
} );
