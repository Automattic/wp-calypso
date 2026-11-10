import { eventToLogstashPayload, makeLogstashTransport, redactUrl } from '../logstash-transport';
import type * as SentryApi from '@sentry/react';

type Envelope = Parameters< ReturnType< typeof makeLogstashTransport >[ 'send' ] >[ 0 ];

const exceptionEvent: SentryApi.Event = {
	event_id: 'abc123',
	level: 'error',
	environment: 'production',
	release: 'calypso_deadbeef',
	user: { id: '42' },
	tags: { calypso_section: 'dashboard', blog_id: 1234, 'DOMException.code': 8 },
	contexts: { trace: { trace_id: 'trace123', span_id: 'span456' } },
	sdk: { name: 'sentry.javascript.react', version: '7.120.4' },
	fingerprint: [ 'SiteOverview', 'Card' ],
	request: {
		url: 'https://wordpress.com/sites',
		headers: { 'User-Agent': 'test' },
	},
	breadcrumbs: Array.from( { length: 30 }, ( _, i ) =>
		i % 10 === 5
			? { message: `crumb ${ i }`, category: 'navigation', data: { to: `/route-${ i }` } }
			: { message: `crumb ${ i }` }
	),
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
				route: '/route-25',
				trace_id: 'trace123',
				sdk_version: '7.120.4',
				stack_hash: expect.stringMatching( /^[0-9a-f]{8}$/ ),
				top_frame: 'inner (app.js:2:20)',
				tag_dom_exception_code: '8',
			},
		} );
		expect( payload.properties ).not.toHaveProperty( 'tag_calypso_section' );
		expect( payload.properties ).not.toHaveProperty( 'tag_blog_id' );
	} );

	it( 'gives the same stack_hash only to identical stacks', () => {
		const withFrames = ( type: string, colno: number ): SentryApi.Event => ( {
			exception: {
				values: [
					{
						type,
						value: 'differs between events',
						stacktrace: { frames: [ { function: 'f', filename: 'app.js', lineno: 1, colno } ] },
					},
				],
			},
		} );
		const hashOf = ( event: SentryApi.Event ) =>
			eventToLogstashPayload( event ).properties.stack_hash;

		expect( hashOf( withFrames( 'TypeError', 1 ) ) ).toBe( hashOf( withFrames( 'TypeError', 1 ) ) );
		expect( hashOf( withFrames( 'TypeError', 1 ) ) ).not.toBe(
			hashOf( withFrames( 'TypeError', 2 ) )
		);
		expect( hashOf( withFrames( 'TypeError', 1 ) ) ).not.toBe( hashOf( withFrames( 'Error', 1 ) ) );
		expect( hashOf( { message: 'no stack' } ) ).toBeUndefined();
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

describe( 'redactUrl', () => {
	it.each( [
		[
			'https://wordpress.com/setup/processing?oneTapAuth=true&code=eyJhbGci.abc&service=google',
			'https://wordpress.com/setup/processing?oneTapAuth=true&code=redacted&service=google',
		],
		[
			'/log-in/link/use?token=abc123&redirect_to=%2Fsites',
			'/log-in/link/use?token=redacted&redirect_to=%2Fsites',
		],
		[
			'https://wordpress.com/connect#access_token=abc&expires_in=3600&refresh_token=def',
			'https://wordpress.com/connect#access_token=redacted&expires_in=3600&refresh_token=redacted',
		],
		[
			'https://wordpress.com/x?client_secret=s&api_key=k&_wpnonce=n',
			'https://wordpress.com/x?client_secret=redacted&api_key=redacted&_wpnonce=redacted',
		],
		[
			'https://wordpress.com/themes?keyword=dark&postcode=1',
			'https://wordpress.com/themes?keyword=dark&postcode=1',
		],
		[ 'https://wordpress.com/sites', 'https://wordpress.com/sites' ],
	] )( 'redacts secret params in %s', ( url, expected ) => {
		expect( redactUrl( url ) ).toBe( expected );
	} );

	it( 'redacts secrets everywhere the event carries a URL', () => {
		const payload = eventToLogstashPayload( {
			message: 'oops',
			request: {
				url: 'https://wordpress.com/setup?code=secret1',
				query_string: { code: 'secret2', step: 'domains' },
			},
			breadcrumbs: [
				{ category: 'fetch', data: { url: '/rest/v1.1/me?access_token=secret3' } },
				{
					category: 'navigation',
					data: { from: '/start?token=secret4', to: '/setup?code=secret5' },
				},
			],
		} );

		expect( payload.properties.url ).toBe( 'https://wordpress.com/setup?code=redacted' );
		expect( payload.properties.route ).toBe( '/setup?code=redacted' );
		expect( payload.extra ).not.toMatch( /secret\d/ );
		expect( JSON.parse( payload.extra ?? '' ).request.query_string ).toEqual( {
			code: 'redacted',
			step: 'domains',
		} );
	} );
} );

describe( 'makeLogstashTransport', () => {
	let fetchMock: jest.Mock;
	const originalFetch = global.fetch;

	beforeEach( () => {
		fetchMock = jest.fn().mockResolvedValue( {} );
		global.fetch = fetchMock;
	} );

	afterEach( () => {
		global.fetch = originalFetch;
		jest.restoreAllMocks();
		jest.useRealTimers();
	} );

	it( 'sends only event items to logstash', async () => {
		const envelope = envelopeWith( [ 'event', exceptionEvent ], [ 'session', {} ] );

		await expect( makeLogstashTransport().send( envelope ) ).resolves.toEqual( {} );

		expect( fetchMock ).toHaveBeenCalledTimes( 1 );
		const [ url, init ] = fetchMock.mock.calls[ 0 ];
		expect( url ).toBe( 'https://public-api.wordpress.com/rest/v1.1/logstash' );
		expect( init ).toMatchObject( { method: 'POST', credentials: 'omit', keepalive: true } );
		expect( parseBody( init.body ).properties.event_id ).toBe( 'abc123' );
	} );

	it( 'uses keepalive only while in-flight logstash requests stay under the limit', async () => {
		fetchMock.mockReturnValue( new Promise( () => {} ) );
		const transport = makeLogstashTransport();
		const mediumEvent = { ...exceptionEvent, extra: { blob: 'x'.repeat( 25000 ) } };
		const hugeEvent = { ...exceptionEvent, extra: { blob: 'x'.repeat( 70000 ) } };

		await transport.send( envelopeWith( [ 'event', mediumEvent ] ) );
		await transport.send( envelopeWith( [ 'event', mediumEvent ] ) );
		await transport.send( envelopeWith( [ 'event', mediumEvent ] ) );
		await makeLogstashTransport().send( envelopeWith( [ 'event', hugeEvent ] ) );

		expect( fetchMock.mock.calls.map( ( [ , init ] ) => init.keepalive ) ).toEqual( [
			true,
			true,
			false,
			false,
		] );
	} );

	it( 'sends at most 10 events a minute and reports how many it dropped', async () => {
		const now = jest.spyOn( Date, 'now' ).mockReturnValue( 1_000_000 );
		const transport = makeLogstashTransport();
		const envelope = envelopeWith( [ 'event', exceptionEvent ] );

		for ( let i = 0; i < 12; i++ ) {
			await transport.send( envelope );
		}
		expect( fetchMock ).toHaveBeenCalledTimes( 10 );
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
		await makeLogstashTransport().send(
			envelopeWith( [ 'session', {} ], [ 'client_report', {} ] )
		);

		expect( fetchMock ).not.toHaveBeenCalled();
	} );

	it( 'resolves without throwing when logstash can’t be reached', async () => {
		const envelope = envelopeWith( [ 'event', exceptionEvent ] );

		// @ts-expect-error Simulating an environment without fetch.
		delete global.fetch;
		await expect( makeLogstashTransport().send( envelope ) ).resolves.toEqual( {} );

		global.fetch = fetchMock;
		fetchMock.mockRejectedValue( new Error( 'network down' ) );
		await expect( makeLogstashTransport().send( envelope ) ).resolves.toEqual( {} );

		fetchMock.mockImplementation( () => {
			throw new Error( 'fetch blew up synchronously' );
		} );
		await expect( makeLogstashTransport().send( envelope ) ).resolves.toEqual( {} );
	} );

	it( 'drops an event that can’t be serialized', async () => {
		const envelope = envelopeWith( [
			'event',
			{ ...exceptionEvent, extra: { big: BigInt( 1 ) } },
		] );

		await expect( makeLogstashTransport().send( envelope ) ).resolves.toEqual( {} );
		expect( fetchMock ).not.toHaveBeenCalled();
	} );

	it( 'flushes once pending requests settle, or reports a timeout', async () => {
		let finishRequest = () => {};
		fetchMock.mockReturnValue( new Promise( ( resolve ) => ( finishRequest = resolve ) ) );
		const transport = makeLogstashTransport();
		await transport.send( envelopeWith( [ 'event', exceptionEvent ] ) );

		jest.useFakeTimers();
		const timedOut = transport.flush( 100 );
		jest.advanceTimersByTime( 100 );
		await expect( timedOut ).resolves.toBe( false );

		finishRequest();
		await expect( transport.flush( 100 ) ).resolves.toBe( true );
	} );
} );
