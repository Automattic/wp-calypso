import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { MyHomePage } from '../../../lib/pages/my-home-page';
import {
	registerThrottleActionHandler,
	resetThrottleState,
	THROTTLE_ACTION_ENV_VARS,
} from '../../../lib/throttle-flags';
import type { ThrottleActionHandler } from '../../../lib/throttle-flags';
import type { Page, Response } from 'playwright';

const HTTP_OK = 200;
const HTTP_INTERNAL_SERVER_ERROR = 500;
const HTTP_BAD_GATEWAY = 502;
const SITE_SLUG = 'example.wordpress.com';
const GOTO_TIMEOUT_MS = 20 * 1000;
const SUGGESTIONS_EXPIRATION = 'THROTTLE_DOMAIN_SUGGESTIONS_EXPIRATION';
const SUGGESTIONS_ACTION = THROTTLE_ACTION_ENV_VARS[ 'domain-suggestions' ];
const BAN_MS = 60 * 1000;

const buildResponse = ( status: number ) => ( { status: () => status } ) as unknown as Response;

/**
 * A page whose navigations answer with the given responses in turn, whose
 * error-page detector answers with the given results in turn (false after),
 * and whose suggested-domain wait fails with the given error.
 */
const buildPage = (
	responses: Array< Response | null >,
	errorPages: boolean[] = [],
	waitError: Error = new Error( 'Timeout 60000ms exceeded.' )
) => {
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

	const waitFor = vi.fn( async () => {
		throw waitError;
	} );
	const main = { getByTestId: () => ( { filter: () => ( { waitFor } ) } ) };

	return {
		goto,
		evaluate,
		waitForTimeout: vi.fn( async () => undefined ),
		getByRole: ( role: string ) => ( role === 'main' ? main : {} ),
	};
};

describe( 'MyHomePage', () => {
	beforeEach( () => {
		// No domain-suggestions ban in force, so only the page decides the error.
		delete process.env[ SUGGESTIONS_EXPIRATION ];
	} );

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	describe( 'visit', () => {
		test( 'backs off and navigates again after a 502, keeping the per-attempt timeout', async () => {
			const page = buildPage( [ buildResponse( HTTP_BAD_GATEWAY ), buildResponse( HTTP_OK ) ] );
			vi.spyOn( console, 'warn' ).mockImplementation( () => undefined );

			await new MyHomePage( page as unknown as Page ).visit( SITE_SLUG );

			const attempt = [
				expect.stringMatching( new RegExp( `/home/${ SITE_SLUG }$` ) ),
				{ timeout: GOTO_TIMEOUT_MS },
			];
			expect( page.goto.mock.calls ).toEqual( [ attempt, attempt ] );
			expect( page.waitForTimeout.mock.calls ).toEqual( [ [ 5_000 ] ] );
		} );

		test( 'throws once every attempt returned a 502', async () => {
			const badGateway = buildResponse( HTTP_BAD_GATEWAY );
			const page = buildPage( [ badGateway, badGateway, badGateway, badGateway ] );
			vi.spyOn( console, 'warn' ).mockImplementation( () => undefined );

			await expect( new MyHomePage( page as unknown as Page ).visit( SITE_SLUG ) ).rejects.toThrow(
				/status 502\) after 4 attempts/
			);

			expect( page.goto ).toHaveBeenCalledTimes( 4 );
		} );

		test( 'does not retry a 500', async () => {
			const page = buildPage( [
				buildResponse( HTTP_INTERNAL_SERVER_ERROR ),
				buildResponse( HTTP_OK ),
			] );

			await new MyHomePage( page as unknown as Page ).visit( SITE_SLUG );

			expect( page.goto ).toHaveBeenCalledTimes( 1 );
			expect( page.waitForTimeout ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'waitForSuggestedUpsellDomain', () => {
		const handler = vi.fn< ThrottleActionHandler >();
		let unregister: () => void;

		beforeEach( () => {
			// A ban in force, so the order of the error-page and ban checks shows.
			process.env[ SUGGESTIONS_EXPIRATION ] = String( Date.now() + BAN_MS );
			delete process.env[ SUGGESTIONS_ACTION ];
			unregister = registerThrottleActionHandler( handler );
		} );

		afterEach( () => {
			unregister();
			handler.mockReset();
			resetThrottleState();
			delete process.env[ SUGGESTIONS_EXPIRATION ];
		} );

		test( 'names the transient server error when the page is a 502', async () => {
			const page = buildPage( [], [ true ] );

			await expect(
				new MyHomePage( page as unknown as Page ).waitForSuggestedUpsellDomain()
			).rejects.toThrow( 'Home page shows a transient server error (502/503/504)' );
			expect( handler ).not.toHaveBeenCalled();
			expect( page.evaluate ).toHaveBeenCalledWith( expect.any( Function ), true );
		} );

		test( 'rethrows the wait error on a regular page', async () => {
			const waitError = new Error( 'Timeout 60000ms exceeded.' );
			const page = buildPage( [], [ false ], waitError );

			await expect(
				new MyHomePage( page as unknown as Page ).waitForSuggestedUpsellDomain()
			).rejects.toBe( waitError );
			expect( handler ).toHaveBeenCalledWith( 'skip', [ 'domain-suggestions' ] );
		} );
	} );
} );
