import events from 'events';
import config from '@automattic/calypso-config';
import superagent from 'superagent';
import * as statsdUtils from 'calypso/lib/analytics/statsd-utils';
import { logSectionResponse } from 'calypso/server/pages/analytics';

const TWO_SECONDS = 2000;

const noop = () => {};

jest.mock( '@automattic/calypso-config', () => jest.fn() );

describe( 'index', () => {
	beforeAll( function () {
		// Enable analytics tracking on the server.
		config.mockReturnValue( true );
	} );

	beforeEach( () => {
		jest.spyOn( superagent, 'get' ).mockReturnValue( { end: () => {} } );
	} );

	afterEach( () => {
		superagent.get.mockClear();
	} );

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
			// Clear throttling
			jest.advanceTimersByTime( TWO_SECONDS );
		} );

		// Parses the beacons sent in the URL to boom.gif
		const includesBeacon = ( partialBeacon ) => {
			const statsdUrl = new URL( superagent.get.mock.calls[ 0 ][ 0 ] );
			const { beacons } = JSON.parse( decodeURIComponent( statsdUrl.searchParams.get( 'json' ) ) );
			return beacons.some( ( beacon ) => beacon.includes( partialBeacon ) );
		};

		describe( 'when rendering a section', () => {
			jest.useFakeTimers();

			beforeEach( () => {
				request.context.sectionName = 'reader';
			} );

			test( 'logs response analytics', () => {
				logSectionResponse( request, response, next );

				// Move time forward and mock the "finish" event
				jest.advanceTimersByTime( TWO_SECONDS );
				response.emit( 'finish' );

				// Check the information sent to boom.gif.
				expect( includesBeacon( `reader.response_time:${ TWO_SECONDS }` ) );
			} );

			test( 'throttles calls to log analytics', () => {
				// We only want to mock this for one test, as it will prevent our
				// superagent spy above from working.
				const analyticsMock = jest.spyOn( statsdUtils, 'logServerEvent' );

				logSectionResponse( request, response, next );
				logSectionResponse( request2, response2, next );

				response.emit( 'finish' );
				response2.emit( 'finish' );

				expect( statsdUtils.logServerEvent ).toBeCalledTimes( 1 );

				jest.advanceTimersByTime( TWO_SECONDS );
				response.emit( 'finish' );
				response2.emit( 'finish' );

				expect( statsdUtils.logServerEvent ).toBeCalledTimes( 2 );
				analyticsMock.mockRestore();
			} );
		} );

		describe( 'when not rendering a section', () => {
			beforeEach( () => {
				jest.spyOn( statsdUtils, 'logServerEvent' );
			} );

			afterEach( () => {
				statsdUtils.logServerEvent.mockReset();
			} );

			test( 'does not log response time analytics', () => {
				logSectionResponse( request, response, next );

				// Mock the "finish" event
				response.emit( 'close' );

				expect( statsdUtils.logServerEvent ).not.toBeCalled();
			} );
		} );
	} );
} );
