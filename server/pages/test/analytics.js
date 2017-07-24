/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import { useFakeTimers } from 'test/helpers/use-sinon';
import events from 'events';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import analytics from '../../lib/analytics';
import { logSectionResponseTime } from 'pages/analytics';

const TWO_SECONDS = 2000;

describe( 'index', function() {
	describe( 'logResponseTime middleware', function() {
		// Stub request, response, and next
		let request, response, next;
		let request2, response2;
		beforeEach( function() {
			request = { context: {} };
			request2 = { context: {} };
			response = new events.EventEmitter();
			response2 = new events.EventEmitter();
			next = noop;
		} );

		describe( 'when rendering a section', function() {
			let clock;

			useFakeTimers( newClock => clock = newClock );

			beforeEach( function() {
				sinon.stub( analytics.statsd, 'recordTiming' );
				request.context.sectionName = 'reader';
			} );

			afterEach( function() {
				analytics.statsd.recordTiming.restore();
			} );

			it( 'logs response time analytics', function() {
				// Clear throttling
				clock.tick( TWO_SECONDS );

				logSectionResponseTime( request, response, next );

				// Move time forward and mock the "finish" event
				clock.tick( TWO_SECONDS );
				response.emit( 'finish' );

				expect( analytics.statsd.recordTiming ).to.have.been.calledWith(
					'reader', 'response-time', TWO_SECONDS
				);
			} );

			it( 'throttles calls to log analytics', function() {
				// Clear throttling
				clock.tick( TWO_SECONDS );

				logSectionResponseTime( request, response, next );
				logSectionResponseTime( request2, response2, next );

				response.emit( 'finish' );
				response2.emit( 'finish' );

				expect( analytics.statsd.recordTiming ).to.have.been.calledOnce;

				clock.tick( TWO_SECONDS );
				response.emit( 'finish' );
				response2.emit( 'finish' );

				expect( analytics.statsd.recordTiming ).to.have.been.calledTwice;
			} );
		} );

		describe( 'when not rendering a section', function() {
			beforeEach( function() {
				sinon.stub( analytics.statsd, 'recordTiming' );
			} );

			afterEach( function() {
				analytics.statsd.recordTiming.restore();
			} );

			it( 'does not log response time analytics', function() {
				logSectionResponseTime( request, response, next );

				// Mock the "finish" event
				response.emit( 'finish' );

				expect( analytics.statsd.recordTiming ).not.to.have.been.called;
			} );
		} );
	} );
} );
