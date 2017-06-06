/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { useFakeTimers } from 'test/helpers/use-sinon';
import delayedDispatch from '../middleware';
import { delayDispatch } from '../actions';

const action = { type: 'SPIN' };
const delay = 1337;

describe( '#delayedDispatch', () => {
	let clock;
	let dispatch;
	let middleware;
	let next;

	useFakeTimers( fakeClock => clock = fakeClock );

	beforeEach( () => {
		dispatch = spy();
		next = spy();
		middleware = delayedDispatch( { dispatch } )( next );
	} );

	it( 'should pass through non-delayed actions', () => {
		middleware( action );

		expect( dispatch ).to.not.have.been.called;
		expect( next ).to.have.been.calledOnce;
		expect( next ).to.have.been.calledWith( action );
	} );

	it( 'should delay delayed actions by prescribed delay', () => {
		middleware( delayDispatch( delay, action ) );

		expect( dispatch ).to.not.have.been.called;
		expect( next ).to.not.have.been.called;

		clock.tick( delay );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( action );
		expect( next ).to.not.have.been.called;
	} );

	it( 'should not continue to call delayed actions', () => {
		middleware( delayDispatch( delay, action ) );

		clock.tick( delay * 100 );

		expect( dispatch ).to.have.been.calledOnce;
		expect( next ).to.not.have.been.called;
	} );
} );
