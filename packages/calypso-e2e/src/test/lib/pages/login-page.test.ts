import { afterEach, describe, expect, test, vi } from 'vitest';
import { LoginPage } from '../../../lib/pages/login-page';
import type { Page, Response } from 'playwright';

const HTTP_OK = 200;
const HTTP_BAD_GATEWAY = 502;

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

	const page = {
		goto,
		evaluate,
		route: vi.fn( async () => undefined ),
		waitForTimeout: vi.fn( async () => undefined ),
	};

	return page;
};

describe( 'LoginPage.visit', () => {
	afterEach( () => {
		vi.restoreAllMocks();
	} );

	// The retry itself is covered by gotoWithRetry's tests; this pins the wiring.
	test( 'backs off and navigates to the login page again after a 502', async () => {
		const ok = buildResponse( HTTP_OK );
		const page = buildPage( [ buildResponse( HTTP_BAD_GATEWAY ), ok ] );
		vi.spyOn( console, 'warn' ).mockImplementation( () => undefined );

		await expect( new LoginPage( page as unknown as Page ).visit() ).resolves.toBe( ok );

		expect( page.waitForTimeout.mock.calls ).toEqual( [ [ 5_000 ] ] );
		const loginUrl = expect.stringMatching( /\/log-in$/ );
		expect( page.goto.mock.calls.map( ( [ url ] ) => url ) ).toEqual( [ loginUrl, loginUrl ] );
		expect( page.route ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'returns a 200 response without waiting or retrying', async () => {
		const response = buildResponse( HTTP_OK );
		const page = buildPage( [ response, buildResponse( HTTP_BAD_GATEWAY ) ] );

		await expect( new LoginPage( page as unknown as Page ).visit( { path: 'new' } ) ).resolves.toBe(
			response
		);

		expect( page.waitForTimeout ).not.toHaveBeenCalled();
		expect( page.goto.mock.calls.map( ( [ url ] ) => url ) ).toEqual( [
			expect.stringMatching( /\/log-in\/new$/ ),
		] );
	} );
} );
