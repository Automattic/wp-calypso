import { afterEach, describe, expect, test, vi } from 'vitest';
import { MyHomePage } from '../../../lib/pages/my-home-page';
import type { Page, Response } from 'playwright';

const HTTP_OK = 200;
const HTTP_INTERNAL_SERVER_ERROR = 500;
const HTTP_BAD_GATEWAY = 502;
const SITE_SLUG = 'example.wordpress.com';
const GOTO_TIMEOUT_MS = 20 * 1000;

const buildResponse = ( status: number ) => ( { status: () => status } ) as unknown as Response;

/**
 * A page whose navigations answer with the given responses in turn, and whose
 * error-page detector answers with the given results in turn (false after).
 */
const buildPage = ( responses: Array< Response | null >, errorPages: boolean[] = [] ) => {
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

	return {
		goto,
		evaluate,
		waitForTimeout: vi.fn( async () => undefined ),
		getByRole: () => ( {} ),
	};
};

describe( 'MyHomePage', () => {
	afterEach( () => {
		vi.restoreAllMocks();
	} );

	describe( 'visit', () => {
		test( 'backs off and navigates again after a 502, keeping the per-attempt timeout', async () => {
			const page = buildPage( [ buildResponse( HTTP_BAD_GATEWAY ), buildResponse( HTTP_OK ) ] );
			vi.spyOn( console, 'warn' ).mockImplementation( () => undefined );

			await new MyHomePage( page as unknown as Page ).visit( SITE_SLUG );

			const attempt = [
				expect.stringMatching( /\/home\/example\.wordpress\.com$/ ),
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
} );
