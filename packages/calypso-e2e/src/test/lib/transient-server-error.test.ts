import { errors } from 'playwright';
import { afterEach, describe, expect, test, vi } from 'vitest';
import {
	gotoWithRetry,
	isServerErrorPage,
	ServerErrorMatch,
	waitForURLWithRetry,
} from '../../lib/transient-server-error';
import type { Page, Response } from 'playwright';

const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;
const HTTP_INTERNAL_SERVER_ERROR = 500;
const HTTP_BAD_GATEWAY = 502;
const HTTP_SERVICE_UNAVAILABLE = 503;
const HTTP_GATEWAY_TIMEOUT = 504;
const TARGET_URL = 'https://example.com/home/site';
const GOTO_OPTIONS = { timeout: 20_000 };
const PENDING_URL = 'https://example.com/checkout/thank-you/site/pending/1';
const LANDING_URL = /wp-admin|\/sites\/[^/?#]+/;
const WAIT_TIMEOUT = 180_000;

/**
 * A page whose evaluate runs the callback in Node against a stub document with
 * the given title and h1, so the in-browser matcher is exercised for real.
 */
const buildPage = ( title: string, heading: string ) => {
	Object.assign( globalThis, {
		document: { title, querySelector: () => ( { textContent: heading } ) },
	} );

	return {
		evaluate: async < T, A >( callback: ( arg: A ) => T, arg: A ) => callback( arg ),
	} as unknown as Page;
};

describe( 'isServerErrorPage', () => {
	afterEach( () => {
		delete ( globalThis as { document?: unknown } ).document;
	} );

	test.each( [
		[ '502 Bad Gateway', 'Bad Gateway' ],
		[ '503 Service Temporarily Unavailable', '' ],
		[ '', 'Service Unavailable' ],
		[ '504 Gateway Time-out', '' ],
		[ 'Gateway Timeout', '' ],
	] )( 'matches the gateway-error page titled "%s" / headed "%s"', async ( title, heading ) => {
		await expect( isServerErrorPage( buildPage( title, heading ) ) ).resolves.toBe( true );
		await expect(
			isServerErrorPage( buildPage( title, heading ), ServerErrorMatch.AnyServerError )
		).resolves.toBe( true );
	} );

	test( 'matches the 500 page only when asked for any server error', async () => {
		const page = buildPage( '500 Internal Server Error', 'Internal Server Error' );

		await expect( isServerErrorPage( page ) ).resolves.toBe( false );
		await expect( isServerErrorPage( page, ServerErrorMatch.AnyServerError ) ).resolves.toBe(
			true
		);
	} );

	test( 'does not match a regular page', async () => {
		const page = buildPage( 'Log in — WordPress.com', 'Log in to your account' );

		await expect( isServerErrorPage( page ) ).resolves.toBe( false );
		await expect( isServerErrorPage( page, ServerErrorMatch.AnyServerError ) ).resolves.toBe(
			false
		);
	} );

	test( 'treats a failed evaluate as no error page', async () => {
		const page = {
			evaluate: async () => {
				throw new Error( 'Execution context was destroyed.' );
			},
		} as unknown as Page;

		await expect( isServerErrorPage( page ) ).resolves.toBe( false );
	} );
} );

const buildResponse = ( status: number ) => ( { status: () => status } ) as unknown as Response;

/**
 * A page whose navigations answer with the given responses in turn, and whose
 * error-page detector answers with the given results in turn (false after).
 */
const buildNavPage = ( responses: Array< Response | null >, errorPages: boolean[] = [] ) => {
	const goto = vi.fn< ( url: string, options?: unknown ) => Promise< Response | null > >(
		async () => null
	);
	for ( const response of responses ) {
		goto.mockResolvedValueOnce( response );
	}

	const evaluate = vi.fn< ( fn: unknown, arg?: unknown ) => Promise< boolean > >(
		async () => false
	);
	for ( const errorPage of errorPages ) {
		evaluate.mockResolvedValueOnce( errorPage );
	}

	return { goto, evaluate, waitForTimeout: vi.fn( async () => undefined ) };
};

describe( 'gotoWithRetry', () => {
	afterEach( () => {
		vi.restoreAllMocks();
	} );

	test.each( [ HTTP_BAD_GATEWAY, HTTP_SERVICE_UNAVAILABLE, HTTP_GATEWAY_TIMEOUT ] )(
		'backs off and navigates again after a %d',
		async ( status ) => {
			const ok = buildResponse( HTTP_OK );
			const page = buildNavPage( [ buildResponse( status ), ok ] );
			const warn = vi.spyOn( console, 'warn' ).mockImplementation( () => undefined );

			await expect(
				gotoWithRetry( page as unknown as Page, TARGET_URL, GOTO_OPTIONS )
			).resolves.toBe( ok );

			expect( page.waitForTimeout.mock.calls ).toEqual( [ [ 5_000 ] ] );
			// The options apply to each attempt.
			expect( page.goto.mock.calls ).toEqual( [
				[ TARGET_URL, GOTO_OPTIONS ],
				[ TARGET_URL, GOTO_OPTIONS ],
			] );
			expect( warn ).toHaveBeenCalledWith( expect.stringContaining( '1/4' ) );
		}
	);

	test( 'throws once every attempt returned a 502, waiting before each retry', async () => {
		const badGateway = buildResponse( HTTP_BAD_GATEWAY );
		const page = buildNavPage( [ badGateway, badGateway, badGateway, badGateway, badGateway ] );
		vi.spyOn( console, 'warn' ).mockImplementation( () => undefined );

		await expect( gotoWithRetry( page as unknown as Page, TARGET_URL ) ).rejects.toThrow(
			`${ TARGET_URL } still returned a transient server error (status 502) after 4 attempts.`
		);

		expect( page.waitForTimeout.mock.calls ).toEqual( [ [ 5_000 ], [ 10_000 ], [ 20_000 ] ] );
		expect( page.goto ).toHaveBeenCalledTimes( 4 );
		// Each wait sits between two navigations.
		page.waitForTimeout.mock.invocationCallOrder.forEach( ( order, index ) => {
			expect( page.goto.mock.invocationCallOrder[ index ] ).toBeLessThan( order );
			expect( order ).toBeLessThan( page.goto.mock.invocationCallOrder[ index + 1 ] );
		} );
	} );

	test( 'retries a gateway-error page served with a 200 status', async () => {
		const ok = buildResponse( HTTP_OK );
		const page = buildNavPage( [ buildResponse( HTTP_OK ), ok ], [ true ] );
		vi.spyOn( console, 'warn' ).mockImplementation( () => undefined );

		await expect( gotoWithRetry( page as unknown as Page, TARGET_URL ) ).resolves.toBe( ok );

		expect( page.waitForTimeout.mock.calls ).toEqual( [ [ 5_000 ] ] );
		expect( page.goto ).toHaveBeenCalledTimes( 2 );
		// Transient-only: a 500 "Internal Server Error" page must not be retried.
		expect( page.evaluate ).toHaveBeenCalledWith( expect.any( Function ), true );
	} );

	test( 'retries a gateway-error page that came with no response', async () => {
		const ok = buildResponse( HTTP_OK );
		const page = buildNavPage( [ null, ok ], [ true ] );
		vi.spyOn( console, 'warn' ).mockImplementation( () => undefined );

		await expect( gotoWithRetry( page as unknown as Page, TARGET_URL ) ).resolves.toBe( ok );

		expect( page.waitForTimeout.mock.calls ).toEqual( [ [ 5_000 ] ] );
		expect( page.goto ).toHaveBeenCalledTimes( 2 );
	} );

	test.each( [ HTTP_OK, HTTP_NOT_FOUND, HTTP_INTERNAL_SERVER_ERROR ] )(
		'returns a %d response without waiting or retrying',
		async ( status ) => {
			const response = buildResponse( status );
			const page = buildNavPage( [ response, buildResponse( HTTP_BAD_GATEWAY ) ] );

			await expect( gotoWithRetry( page as unknown as Page, TARGET_URL ) ).resolves.toBe(
				response
			);

			expect( page.waitForTimeout ).not.toHaveBeenCalled();
			expect( page.goto ).toHaveBeenCalledTimes( 1 );
		}
	);

	test( 'returns a null response without waiting or retrying', async () => {
		const page = buildNavPage( [ null, buildResponse( HTTP_BAD_GATEWAY ) ] );

		await expect( gotoWithRetry( page as unknown as Page, TARGET_URL ) ).resolves.toBeNull();

		expect( page.waitForTimeout ).not.toHaveBeenCalled();
		expect( page.goto ).toHaveBeenCalledTimes( 1 );
	} );
} );

/**
 * A page on a fake clock. Each waitForURL runs out its timeout and throws a
 * Playwright TimeoutError, except call number `matchOnCall`, which resolves.
 * A timeout of 0 or less rejects: Playwright reads 0 as no timeout. Each
 * waitForTimeout advances the clock; the error-page detector always answers
 * `isErrorPage`.
 */
const buildWaitPage = ( isErrorPage: boolean, matchOnCall?: number ) => {
	let now = 0;
	vi.spyOn( Date, 'now' ).mockImplementation( () => now );

	const waitForURL = vi.fn( async ( url: unknown, options: { timeout: number } ) => {
		if ( options.timeout <= 0 ) {
			throw new Error( 'Unbounded wait.' );
		}

		if ( waitForURL.mock.calls.length === matchOnCall ) {
			return;
		}

		now += options.timeout;
		throw new errors.TimeoutError( `Timeout ${ options.timeout }ms exceeded.` );
	} );

	return {
		url: () => PENDING_URL,
		waitForURL,
		evaluate: vi.fn( async () => isErrorPage ),
		reload: vi.fn( async () => null ),
		waitForTimeout: vi.fn( async ( delay: number ) => {
			now += delay;
		} ),
	};
};

const waitTimeouts = ( page: ReturnType< typeof buildWaitPage > ) =>
	page.waitForURL.mock.calls.map( ( [ , options ] ) => options.timeout );

describe( 'waitForURLWithRetry', () => {
	afterEach( () => {
		vi.restoreAllMocks();
	} );

	test( 'reloads a gateway-error page after backing off, then returns once the URL matches', async () => {
		const page = buildWaitPage( true, 2 );
		const warn = vi.spyOn( console, 'warn' ).mockImplementation( () => undefined );

		await expect(
			waitForURLWithRetry( page as unknown as Page, LANDING_URL, { timeout: WAIT_TIMEOUT } )
		).resolves.toBeUndefined();

		expect( page.waitForURL ).toHaveBeenCalledWith( LANDING_URL, expect.anything() );
		expect( page.waitForTimeout.mock.calls ).toEqual( [ [ 5_000 ] ] );
		expect( page.reload.mock.calls ).toEqual( [ [ { timeout: 170_000 } ] ] );
		expect( page.waitForTimeout.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
			page.reload.mock.invocationCallOrder[ 0 ]
		);
		// Transient-only: a 500 "Internal Server Error" page must not be reloaded.
		expect( page.evaluate ).toHaveBeenCalledWith( expect.any( Function ), true );
		expect( warn ).toHaveBeenCalledWith( expect.stringContaining( '1/4' ) );
	} );

	test( 'keeps waiting without reloading a page that is not an error page', async () => {
		const page = buildWaitPage( false, 3 );

		await expect(
			waitForURLWithRetry( page as unknown as Page, LANDING_URL, { timeout: WAIT_TIMEOUT } )
		).resolves.toBeUndefined();

		expect( page.waitForURL ).toHaveBeenCalledTimes( 3 );
		expect( page.waitForTimeout ).not.toHaveBeenCalled();
		expect( page.reload ).not.toHaveBeenCalled();
	} );

	test( 'throws once every reload landed on a gateway-error page', async () => {
		const page = buildWaitPage( true );
		vi.spyOn( console, 'warn' ).mockImplementation( () => undefined );

		await expect(
			waitForURLWithRetry( page as unknown as Page, LANDING_URL, { timeout: WAIT_TIMEOUT } )
		).rejects.toThrow( `${ PENDING_URL } still showed a transient server error after 4 attempts.` );

		expect( page.waitForTimeout.mock.calls ).toEqual( [ [ 5_000 ], [ 10_000 ], [ 20_000 ] ] );
		expect( page.reload ).toHaveBeenCalledTimes( 3 );
	} );

	test( 'rethrows a non-timeout error without reloading', async () => {
		const page = buildWaitPage( true );
		const closed = new Error( 'Target page, context or browser has been closed' );
		page.waitForURL.mockRejectedValueOnce( closed );

		await expect(
			waitForURLWithRetry( page as unknown as Page, LANDING_URL, { timeout: WAIT_TIMEOUT } )
		).rejects.toBe( closed );

		expect( page.reload ).not.toHaveBeenCalled();
	} );

	test( 'checks in slices and throws the overall timeout once the deadline passes', async () => {
		const page = buildWaitPage( false );
		const wait = waitForURLWithRetry( page as unknown as Page, LANDING_URL, { timeout: 7_000 } );

		await expect( wait ).rejects.toBeInstanceOf( errors.TimeoutError );
		await expect( wait ).rejects.toThrow(
			`Timeout 7000ms exceeded waiting for the URL, on ${ PENDING_URL }.`
		);
		expect( waitTimeouts( page ) ).toEqual( [ 5_000, 2_000 ] );
	} );

	test( 'does not back off or reload past the deadline', async () => {
		const page = buildWaitPage( true );

		await expect(
			waitForURLWithRetry( page as unknown as Page, LANDING_URL, { timeout: 10_000 } )
		).rejects.toThrow( `Timeout 10000ms exceeded waiting for the URL, on ${ PENDING_URL }.` );

		expect( page.waitForTimeout ).not.toHaveBeenCalled();
		expect( page.reload ).not.toHaveBeenCalled();
		expect( waitTimeouts( page ) ).toEqual( [ 5_000, 5_000 ] );
	} );
} );
