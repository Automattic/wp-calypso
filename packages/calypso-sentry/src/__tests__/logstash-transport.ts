import { eventToLogstashPayload, makeLogstashMirrorTransport } from '../logstash-transport';
import type * as SentryApi from '@sentry/react';

type MakeFetchTransport = typeof SentryApi.makeFetchTransport;
type Envelope = Parameters< ReturnType< MakeFetchTransport >[ 'send' ] >[ 0 ];

const exceptionEvent: SentryApi.Event = {
	event_id: 'abc123',
	level: 'error',
	environment: 'production',
	release: 'calypso_deadbeef',
	user: { id: '42' },
	tags: { calypso_section: 'dashboard', blog_id: 1234 },
	fingerprint: [ 'SiteOverview', 'Card' ],
	request: {
		url: 'https://wordpress.com/sites',
		headers: { 'User-Agent': 'test' },
	},
	breadcrumbs: Array.from( { length: 30 }, ( _, i ) => ( { message: `crumb ${ i }` } ) ),
	exception: {
		values: [
			{ type: 'Error', value: 'the cause' },
			{
				type: 'TypeError',
				value: 'x is undefined',
				mechanism: { type: 'react.onUncaughtError', handled: false },
				stacktrace: {
					frames: [
						{ function: 'outer', filename: 'app.js', lineno: 1, colno: 10 },
						{ function: 'inner', filename: 'app.js', lineno: 2, colno: 20 },
					],
				},
			},
		],
	},
};

function parseBody( body: URLSearchParams ) {
	return JSON.parse( body.get( 'params' ) ?? '' );
}

function envelopeWith( ...items: Array< [ string, unknown ] > ): Envelope {
	return [ {}, items.map( ( [ type, payload ] ) => [ { type }, payload ] ) ] as unknown as Envelope;
}

describe( 'eventToLogstashPayload', () => {
	it( 'maps an exception event to the logstash fields', () => {
		const payload = eventToLogstashPayload( exceptionEvent );

		expect( payload ).toMatchObject( {
			feature: 'calypso_client',
			message: 'TypeError: x is undefined',
			severity: 'error',
			tags: [ 'sentry_transport', 'dashboard' ],
			user_id: 42,
			trace: 'at inner (app.js:2:20)\nat outer (app.js:1:10)',
			properties: {
				event_id: 'abc123',
				env_id: 'production',
				release: 'calypso_deadbeef',
				url: 'https://wordpress.com/sites',
				exception_type: 'TypeError',
				handled: false,
				mechanism: 'react.onUncaughtError',
				fingerprint: 'SiteOverview,Card',
				calypso_section: 'dashboard',
				blog_id: '1234',
			},
		} );
	} );

	it( 'drops request headers and keeps only the last 20 breadcrumbs in extra', () => {
		const extra = JSON.parse( eventToLogstashPayload( exceptionEvent ).extra ?? '' );

		expect( extra.request ).toEqual( { url: 'https://wordpress.com/sites' } );
		expect( extra.breadcrumbs ).toHaveLength( 20 );
		expect( extra.breadcrumbs[ 0 ].message ).toBe( 'crumb 10' );
	} );

	it( 'truncates long messages with an ellipsis', () => {
		const { message } = eventToLogstashPayload( { message: 'z'.repeat( 20000 ) } );

		expect( message ).toHaveLength( 10 * 1024 );
		expect( message.endsWith( 'z…' ) ).toBe( true );
	} );

	it( 'maps a captureMessage event', () => {
		const payload = eventToLogstashPayload( { message: 'Something odd', level: 'fatal' } );

		expect( payload ).toMatchObject( {
			message: 'Something odd',
			severity: 'error',
			tags: [ 'sentry_transport' ],
			trace: undefined,
		} );
		expect( payload ).not.toHaveProperty( 'user_id' );
	} );
} );

describe( 'makeLogstashMirrorTransport', () => {
	const sentryResponse = { statusCode: 200 };
	let sentrySend: jest.Mock;
	let fetchMock: jest.Mock;
	const originalFetch = global.fetch;

	function makeTransport() {
		const makeFetchTransport = jest.fn( () => ( {
			send: sentrySend,
			flush: jest.fn(),
		} ) ) as unknown as MakeFetchTransport;
		return makeLogstashMirrorTransport( makeFetchTransport )( {
			url: 'https://sentry.example/api',
			recordDroppedEvent: jest.fn(),
		} );
	}

	beforeEach( () => {
		sentrySend = jest.fn().mockResolvedValue( sentryResponse );
		fetchMock = jest.fn().mockResolvedValue( {} );
		global.fetch = fetchMock;
	} );

	afterEach( () => {
		global.fetch = originalFetch;
		jest.restoreAllMocks();
	} );

	it( 'sends event items to logstash and the whole envelope to Sentry', async () => {
		const envelope = envelopeWith( [ 'event', exceptionEvent ], [ 'session', {} ] );

		await expect( makeTransport().send( envelope ) ).resolves.toBe( sentryResponse );

		expect( sentrySend ).toHaveBeenCalledWith( envelope );
		expect( fetchMock ).toHaveBeenCalledTimes( 1 );
		const [ url, init ] = fetchMock.mock.calls[ 0 ];
		expect( url ).toBe( 'https://public-api.wordpress.com/rest/v1.1/logstash' );
		expect( init ).toMatchObject( { method: 'POST', credentials: 'omit', keepalive: true } );
		expect( parseBody( init.body ).properties.event_id ).toBe( 'abc123' );
	} );

	it( 'uses keepalive only while in-flight logstash requests stay under the limit', async () => {
		fetchMock.mockReturnValue( new Promise( () => {} ) );
		const transport = makeTransport();
		const mediumEvent = { ...exceptionEvent, extra: { blob: 'x'.repeat( 25000 ) } };
		const hugeEvent = { ...exceptionEvent, extra: { blob: 'x'.repeat( 70000 ) } };

		await transport.send( envelopeWith( [ 'event', mediumEvent ] ) );
		await transport.send( envelopeWith( [ 'event', mediumEvent ] ) );
		await transport.send( envelopeWith( [ 'event', mediumEvent ] ) );
		await makeTransport().send( envelopeWith( [ 'event', hugeEvent ] ) );

		expect( fetchMock.mock.calls.map( ( [ , init ] ) => init.keepalive ) ).toEqual( [
			true,
			true,
			false,
			false,
		] );
	} );

	it( 'sends at most 10 events a minute and reports how many it dropped', async () => {
		const now = jest.spyOn( Date, 'now' ).mockReturnValue( 1_000_000 );
		const transport = makeTransport();
		const envelope = envelopeWith( [ 'event', exceptionEvent ] );

		for ( let i = 0; i < 12; i++ ) {
			await transport.send( envelope );
		}
		expect( fetchMock ).toHaveBeenCalledTimes( 10 );
		expect( sentrySend ).toHaveBeenCalledTimes( 12 );
		expect( parseBody( fetchMock.mock.calls[ 9 ][ 1 ].body ).properties ).not.toHaveProperty(
			'throttled_count'
		);

		now.mockReturnValue( 1_000_000 + 60_000 );
		await transport.send( envelope );
		await transport.send( envelope );

		expect( fetchMock ).toHaveBeenCalledTimes( 12 );
		expect( parseBody( fetchMock.mock.calls[ 10 ][ 1 ].body ).properties.throttled_count ).toBe(
			2
		);
		expect( parseBody( fetchMock.mock.calls[ 11 ][ 1 ].body ).properties ).not.toHaveProperty(
			'throttled_count'
		);
	} );

	it( 'does not send non-event envelopes to logstash', async () => {
		await makeTransport().send( envelopeWith( [ 'session', {} ], [ 'client_report', {} ] ) );

		expect( fetchMock ).not.toHaveBeenCalled();
		expect( sentrySend ).toHaveBeenCalled();
	} );

	it( 'still delivers to Sentry when fetch is unavailable', async () => {
		// @ts-expect-error Simulating an environment without fetch.
		delete global.fetch;
		const envelope = envelopeWith( [ 'event', exceptionEvent ] );

		await expect( makeTransport().send( envelope ) ).resolves.toBe( sentryResponse );
	} );

	it( 'still delivers to Sentry when logstash fails', async () => {
		fetchMock.mockRejectedValue( new Error( 'network down' ) );
		const envelope = envelopeWith( [ 'event', exceptionEvent ] );

		await expect( makeTransport().send( envelope ) ).resolves.toBe( sentryResponse );

		fetchMock.mockImplementation( () => {
			throw new Error( 'fetch blew up synchronously' );
		} );
		await expect( makeTransport().send( envelope ) ).resolves.toBe( sentryResponse );
		expect( sentrySend ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'still delivers to Sentry when the event can’t be serialized', async () => {
		const envelope = envelopeWith( [
			'event',
			{ ...exceptionEvent, extra: { big: BigInt( 1 ) } },
		] );

		await expect( makeTransport().send( envelope ) ).resolves.toBe( sentryResponse );
		expect( fetchMock ).not.toHaveBeenCalled();
	} );
} );
