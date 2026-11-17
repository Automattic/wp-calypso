/**
 * @vitest-environment jsdom
 */

import { captureException } from '@automattic/calypso-sentry';
import { type MockInstance, vi } from 'vitest';
import { logToLogstash } from 'calypso/lib/logstash';
import { maybeReloadForChunkError } from '../../chunk-load-recovery';
import { getDomInterferenceReport } from '../dom-interference';
import { handleOnCatch, handleUncaughtError, initLogger } from '../index';
import type { AnyRouter } from '@tanstack/react-router';
import type { ErrorInfo } from 'react';

vi.mock( '@automattic/calypso-config', () => ( { default: vi.fn( () => 'development' ) } ) );
vi.mock( '@automattic/calypso-sentry', () => ( {
	captureException: vi.fn(),
} ) );
vi.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: vi.fn(),
} ) );
vi.mock( '../../chunk-load-recovery', () => ( {
	maybeReloadForChunkError: vi.fn(),
} ) );
vi.mock( '../dom-interference', () => ( {
	getDomInterferenceReport: vi.fn( () => ( {
		tags: { dom_google_translate: 'true' },
		context: { fontCount: 3 },
	} ) ),
} ) );

const mockedLogToLogstash = vi.mocked( logToLogstash );
const mockedCaptureException = vi.mocked( captureException );
const mockedMaybeReloadForChunkError = vi.mocked( maybeReloadForChunkError );

beforeEach( () => {
	vi.clearAllMocks();
	mockedMaybeReloadForChunkError.mockReturnValue( false );
	vi.mocked( getDomInterferenceReport ).mockReturnValue( {
		tags: { dom_google_translate: 'true' },
		context: { fontCount: 3 },
	} );
} );

type ResolvedListener = ( event: { fromLocation?: { href: string } } ) => void;

/**
 * A router that can replay `onResolved`, so tests can navigate the way
 * `initLogger` observes it: `fromLocation` is absent on the first
 * resolve and holds the origin route afterwards.
 */
const createRouter = ( params: Record< string, string > ) => {
	const listeners: ResolvedListener[] = [];

	return {
		state: {
			matches: [ { params } ],
		},
		subscribe: ( _eventType: string, listener: ResolvedListener ) => {
			listeners.push( listener );
			return () => {};
		},
		resolveNavigation: ( fromHref?: string ) =>
			listeners.forEach( ( listener ) =>
				listener( { fromLocation: fromHref ? { href: fromHref } : undefined } )
			),
	} as unknown as AnyRouter & { resolveNavigation: ( fromHref?: string ) => void };
};

const createErrorInfo = ( stack = 'at SomeComponent' ): ErrorInfo => ( {
	componentStack: stack,
} );

describe( 'handleOnCatch', () => {
	test( 'does not log or capture benign inaccessible Jetpack error', () => {
		const error = new Error( 'The Jetpack site is inaccessible or returned an error' );
		error.name = 'ParseError';

		const errorInfo = createErrorInfo();
		const router = createRouter( { siteSlug: 'my-site' } );

		handleOnCatch( error, errorInfo, router, {
			severity: 'error',
			dashboard_backport: false,
			calypso_section: 'dashboard',
		} );

		expect( mockedLogToLogstash ).not.toHaveBeenCalled();
		expect( mockedCaptureException ).not.toHaveBeenCalled();
	} );

	test( 'logs and captures a non-benign error with DOM fingerprint and component stack', () => {
		const error = new Error( 'Boom' );
		const errorInfo = createErrorInfo( 'at SitePage' );
		const router = createRouter( { siteSlug: 'my-site', someId: '123' } );

		initLogger( router );
		router.resolveNavigation();
		router.resolveNavigation( '/sites/my-site' );

		handleOnCatch( error, errorInfo, router, {
			severity: 'error',
			dashboard_backport: false,
			calypso_section: 'dashboard',
		} );

		expect( mockedLogToLogstash ).toHaveBeenCalledTimes( 1 );
		expect( mockedLogToLogstash ).toHaveBeenCalledWith( {
			feature: 'calypso_client',
			message: 'Boom',
			severity: 'error',
			tags: [ 'dashboard' ],
			properties: {
				dashboard_backport: false,
				env_id: 'development',
				message: 'Boom',
				stack: 'at SitePage',
				path: 'https://example.com/',
				previous_path: '/sites/my-site',
				params: {
					site_slug: 'my-site',
					some_id: '123',
				},
				dom_google_translate: 'true',
				dom_interference: { fontCount: 3 },
			},
		} );

		expect( mockedCaptureException ).toHaveBeenCalledTimes( 1 );
		expect( mockedCaptureException ).toHaveBeenCalledWith( error, {
			captureContext: {
				tags: {
					calypso_section: 'dashboard',
					site_slug: 'my-site',
					some_id: '123',
					dom_google_translate: 'true',
				},
				contexts: {
					'dom-interference': { fontCount: 3 },
					react: { componentStack: 'at SitePage' },
				},
				extra: { previous_path: '/sites/my-site' },
				// Splits the react-dom mega-issue by the failing component without
				// touching `exception.values`.
				fingerprint: [ '{{ default }}', 'SitePage' ],
			},
		} );
	} );

	test( 'reports no previous path when the error happens on a fresh page load', () => {
		const error = new Error( 'Boom' );
		const router = createRouter( { siteSlug: 'my-site' } );

		initLogger( router );
		router.resolveNavigation();

		handleOnCatch( error, createErrorInfo(), router, {
			severity: 'error',
			dashboard_backport: false,
			calypso_section: 'dashboard',
		} );

		expect( mockedLogToLogstash ).toHaveBeenCalledWith(
			expect.objectContaining( {
				properties: expect.objectContaining( { previous_path: undefined } ),
			} )
		);
	} );

	test( 'does not log or capture when a chunk load error triggers a reload', () => {
		mockedMaybeReloadForChunkError.mockReturnValue( true );

		const error = new Error( 'Loading chunk emails failed.' );
		error.name = 'ChunkLoadError';

		handleOnCatch( error, createErrorInfo(), createRouter( { siteSlug: 'my-site' } ), {
			severity: 'error',
			dashboard_backport: false,
			calypso_section: 'dashboard',
		} );

		expect( mockedLogToLogstash ).not.toHaveBeenCalled();
		expect( mockedCaptureException ).not.toHaveBeenCalled();
	} );

	test( 'logs but does not capture when dashboard_backport is true', () => {
		const error = new Error( 'Backport-only error' );
		const errorInfo = createErrorInfo();
		const router = createRouter( { siteSlug: 'my-site' } );

		handleOnCatch( error, errorInfo, router, {
			severity: 'debug',
			dashboard_backport: true,
			calypso_section: 'dashboard',
		} );

		expect( mockedLogToLogstash ).toHaveBeenCalledTimes( 1 );
		expect( mockedCaptureException ).not.toHaveBeenCalled();
	} );
} );

describe( 'handleUncaughtError', () => {
	let consoleError: MockInstance;

	beforeEach( () => {
		consoleError = vi.spyOn( console, 'error' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		consoleError.mockRestore();
	} );

	test( 'reports an uncaught error with fingerprint and component stack, and still console.errors', () => {
		const error = new Error( 'Uncaught boom' );

		handleUncaughtError( error, { componentStack: 'at DomainUpsellCardContent' } );

		expect( mockedLogToLogstash ).toHaveBeenCalledTimes( 1 );
		expect( mockedCaptureException ).toHaveBeenCalledWith( error, {
			captureContext: {
				tags: {
					calypso_section: 'dashboard',
					dom_google_translate: 'true',
				},
				contexts: {
					'dom-interference': { fontCount: 3 },
					react: { componentStack: 'at DomainUpsellCardContent' },
				},
				fingerprint: [ '{{ default }}', 'DomainUpsellCardContent' ],
			},
			// Without this React's own `reportGlobalError` path is bypassed and
			// Sentry would default the event to `handled: true`.
			mechanism: { type: 'react.onUncaughtError', handled: false },
		} );
		expect( consoleError ).toHaveBeenCalledWith( error );
	} );

	test( 'normalizes a non-Error value before reporting', () => {
		handleUncaughtError( 'just a string', {} );

		expect( mockedCaptureException ).toHaveBeenCalledTimes( 1 );
		const reported = mockedCaptureException.mock.calls[ 0 ][ 0 ] as Error;
		expect( reported ).toBeInstanceOf( Error );
		expect( reported.message ).toBe( 'just a string' );
	} );
} );
