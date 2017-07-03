/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import { useFakeTimers } from 'test/helpers/use-sinon';
import events from 'events';
import noop from 'lodash/noop';

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
		beforeEach( function() {
			request = { context: {} };
			response = new events.EventEmitter();
			next = noop;
		} );

		context( 'when rendering a section', function() {
			useFakeTimers();

			beforeEach( function() {
				sinon.stub( analytics.statsd, 'recordTiming' );
				request.context.sectionName = 'reader';
			} );

			afterEach( function() {
				analytics.statsd.recordTiming.restore();
			} );

			it( 'logs response time analytics', function() {
				logSectionResponseTime( request, response, next );

				// Move time forward and mock the "finish" event
				this.clock.tick( TWO_SECONDS );
				response.emit( 'finish' );

				expect( analytics.statsd.recordTiming ).to.have.been.calledWith(
					'reader', 'response-time', TWO_SECONDS
				);
			} );
		} );

		context( 'when not rendering a section', function() {
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
