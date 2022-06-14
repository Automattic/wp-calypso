import events from 'events';
import { logSectionResponse } from 'calypso/server/pages/analytics';
import analytics from '../../lib/analytics';

const TWO_SECONDS = 2000;
const noop = () => {};

describe( 'index', () => {
	describe( 'logSectionResponse middleware', () => {
		// Stub request, response, and next
		let request;
		let response;
		let next;
		let request2;
		let response2;
		beforeEach( () => {
			request = { context: {} };
			request2 = { context: {} };
			response = new events.EventEmitter();
			response2 = new events.EventEmitter();
			next = noop;
		} );

		describe( 'when rendering a section', () => {
			jest.useFakeTimers();

			beforeEach( () => {
				jest.spyOn( analytics.statsd, 'recordTiming' );
				jest.spyOn( analytics.statsd, 'recordCounting' );
				request.context.sectionName = 'reader';
				request.context.target = 'evergreen';
			} );

			afterEach( () => {
				analytics.statsd.recordTiming.mockReset();
				analytics.statsd.recordCounting.mockReset();
			} );

			test( 'logs response analytics', () => {
				// Clear throttling
				jest.advanceTimersByTime( TWO_SECONDS );

				logSectionResponse( request, response, next );

				// Move time forward and mock the "finish" event
				jest.advanceTimersByTime( TWO_SECONDS );
				response.emit( 'finish' );

				expect( analytics.statsd.recordTiming ).toBeCalledWith(
					'reader',
					'response-time',
					TWO_SECONDS
				);

				expect( analytics.statsd.recordCounting ).toBeCalledWith( 'reader', 'target.evergreen' );
			} );

			test( 'does not log build target if not defined', () => {
				request.context.target = undefined;

				// Clear throttling
				jest.advanceTimersByTime( TWO_SECONDS );

				logSectionResponse( request, response, next );

				// Move time forward and mock the "finish" event
				jest.advanceTimersByTime( TWO_SECONDS );
				response.emit( 'finish' );

				expect( analytics.statsd.recordTiming ).toBeCalledWith(
					'reader',
					'response-time',
					TWO_SECONDS
				);

				expect( analytics.statsd.recordCounting ).not.toBeCalled();
			} );

			test( 'throttles calls to log analytics', () => {
				// Clear throttling
				jest.advanceTimersByTime( TWO_SECONDS );

				logSectionResponse( request, response, next );
				logSectionResponse( request2, response2, next );

				response.emit( 'finish' );
				response2.emit( 'finish' );

				expect( analytics.statsd.recordTiming ).toBeCalledTimes( 1 );
				expect( analytics.statsd.recordCounting ).toBeCalledTimes( 1 );

				jest.advanceTimersByTime( TWO_SECONDS );
				response.emit( 'finish' );
				response2.emit( 'finish' );

				expect( analytics.statsd.recordTiming ).toBeCalledTimes( 2 );
				expect( analytics.statsd.recordCounting ).toBeCalledTimes( 2 );
			} );
		} );

		describe( 'when not rendering a section', () => {
			beforeEach( () => {
				jest.spyOn( analytics.statsd, 'recordTiming' );
				jest.spyOn( analytics.statsd, 'recordCounting' );
			} );

			afterEach( () => {
				analytics.statsd.recordTiming.mockReset();
				analytics.statsd.recordCounting.mockReset();
			} );

			test( 'does not log response time analytics', () => {
				logSectionResponse( request, response, next );

				// Mock the "finish" event
				response.emit( 'finish' );

				expect( analytics.statsd.recordTiming ).not.toBeCalled();
				expect( analytics.statsd.recordCounting ).not.toBeCalled();
			} );
		} );
	} );
} );
