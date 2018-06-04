/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	logTimingOfNextTick,
	startTickTimer,
	stopTickTimer
} from '../tick-timer';
import analytics from '../';

describe( 'Node Tick Timer', function() {
	beforeEach( function() {
		sinon.stub( analytics.statsd, 'recordTiming' );

		// Just fake the Date
		this.clock = sinon.useFakeTimers( 'Date' );
	} );

	afterEach( function() {
		analytics.statsd.recordTiming.restore();
		this.clock.restore();
	} );

	describe( 'logTimingOfNextTick', function() {
		it( 'logs to statsd the elapsed time of the next iteration of the event loop', function( done ) {
			// Initiate measuring the next tick
			logTimingOfNextTick();

			// After this tick of the event loop, bump the clock time by 100ms.
			// This will be the captured timing data of the next tick.
			setImmediate( () => this.clock.tick( 100 ) );

			// Wait two ticks, and ensure that our timing was recorded. See the
			// comment in the implementation of logTimingOfNextTick to
			// understand why we need to use setImmediate rather than
			// setTimeout here. Basically, it guarantees that two ticks
			// actually go by.
			setImmediate( () => {
				setImmediate( () => {
					expect( analytics.statsd.recordTiming ).to.have.been.calledWith(
						'tick-timer', 'timing', 100
					);
					done();
				} );
			} );
		} );
	} );

	describe( 'startTickTimer', function() {
		beforeEach( function() {
			sinon.stub( global, 'setInterval' );
		} );

		afterEach( function() {
			global.setInterval.restore();
		} );

		it( 'starts an interval to periodically log tick timing', function() {
			startTickTimer( 100 );

			expect( global.setInterval ).to.have.been.calledOnce;
			expect( global.setInterval.getCall( 0 ).args[ 0 ] ).to.equal( logTimingOfNextTick );
		} );

		it( 'runs the interval based on the given period', function() {
			startTickTimer( 100 );

			expect( global.setInterval.getCall( 0 ).args[ 1 ] ).to.equal( 100 );
		} );
	} );

	describe( 'stopTickTimer', function() {
		beforeEach( function() {
			sinon.spy( global, 'clearInterval' );
		} );

		afterEach( function() {
			global.clearInterval.restore();
		} );

		it( 'stops the given timer', function() {
			const timer = startTickTimer( 100 );

			stopTickTimer( timer );

			expect( timer ).not.to.be.undefined;
			expect( global.clearInterval ).to.have.been.calledWith( timer );
		} );
	} );
} );
