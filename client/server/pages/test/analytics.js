import events from 'events';
import { vi } from 'vitest';

const TWO_SECONDS = 2000;
const THREE_SECONDS = 3000;

const noop = () => {};

// Always-enabled config; a factory so it survives the `jest.resetModules()` below.
vi.mock( '@automattic/calypso-config', () => ( { default: () => true } ) );

describe( 'index', () => {
	let fetchMock;
	let statsdUtils;
	let logSectionResponse;

	beforeEach( () => {
		// Fresh module registry per test so analytics.js's module-level throttle
		// starts clean; re-acquire deps from the same registry so the spy applies.
		vi.resetModules();
		vi.useFakeTimers();
		statsdUtils = require( 'calypso/lib/analytics/statsd-utils' );
		( { logSectionResponse } = require( 'calypso/server/pages/analytics' ) );
		fetchMock = vi.spyOn( globalThis, 'fetch' ).mockResolvedValue( undefined );
	} );

	afterEach( () => {
		fetchMock.mockRestore();
		vi.useRealTimers();
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
		} );

		// Parses the beacons sent in the URL to boom.gif
		const includesBeacon = ( partialBeacon ) => {
			const statsdUrl = new URL( fetchMock.mock.calls[ 0 ][ 0 ] );
			const { beacons } = JSON.parse( decodeURIComponent( statsdUrl.searchParams.get( 'json' ) ) );
			return beacons.some( ( beacon ) => beacon.includes( partialBeacon ) );
		};

		describe( 'when rendering a section', () => {
			beforeEach( () => {
				request.context.sectionName = 'reader';
			} );

			test( 'logs response analytics', () => {
				logSectionResponse( request, response, next );

				// Move time forward and mock the "close" event
				vi.advanceTimersByTime( TWO_SECONDS );
				response.emit( 'close' );

				// Check the information sent to boom.gif.
				expect( includesBeacon( `reader.response_time:${ TWO_SECONDS }` ) ).toBe( true );
			} );

			test( 'logs granular analytics', () => {
				// Make the request authenticated
				request.context.user = { foo: 'bar' };
				logSectionResponse( request, response, next );

				// Move time forward and mock the "close" event
				vi.advanceTimersByTime( THREE_SECONDS );
				response.emit( 'close' );

				// Check the information sent to boom.gif.
				expect(
					includesBeacon( `response_time.logged_in.ssr_pipeline_false:${ THREE_SECONDS }` )
				).toBe( true );

				// Double check the loggedin/ssr flags are set correctly.
				expect(
					includesBeacon( `response_time.logged_out.ssr_pipeline_true:${ THREE_SECONDS }` )
				).toBe( false );
			} );

			test( 'throttles calls to log analytics', () => {
				// We only want to mock this for one test, as it will prevent our
				// fetch spy above from working.
				const analyticsMock = vi.spyOn( statsdUtils, 'logServerEvent' );

				logSectionResponse( request, response, next );
				logSectionResponse( request2, response2, next );

				response.emit( 'close' );
				response2.emit( 'close' );

				expect( statsdUtils.logServerEvent ).toHaveBeenCalledTimes( 1 );

				vi.advanceTimersByTime( TWO_SECONDS );
				response.emit( 'close' );
				response2.emit( 'close' );

				expect( statsdUtils.logServerEvent ).toHaveBeenCalledTimes( 2 );
				analyticsMock.mockRestore();
			} );
		} );

		describe( 'when not rendering a section', () => {
			beforeEach( () => {
				vi.spyOn( statsdUtils, 'logServerEvent' );
			} );

			test( 'does not log response time analytics', () => {
				logSectionResponse( request, response, next );

				// Mock the "finish" event
				response.emit( 'finish' );

				expect( statsdUtils.logServerEvent ).not.toHaveBeenCalled();
			} );
		} );
	} );
} );
