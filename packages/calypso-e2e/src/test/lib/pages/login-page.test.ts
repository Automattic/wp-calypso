import { afterEach, describe, expect, jest, test } from '@jest/globals';
import { LoginPage } from '../../../lib/pages/login-page';
import type { Page, Response } from 'playwright';

const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;
const HTTP_INTERNAL_SERVER_ERROR = 500;
const HTTP_BAD_GATEWAY = 502;
const HTTP_SERVICE_UNAVAILABLE = 503;
const HTTP_GATEWAY_TIMEOUT = 504;

const buildResponse = ( status: number ) => ( { status: () => status } ) as unknown as Response;

/**
 * A page whose navigations answer with the given responses in turn, and whose
 * error-page detector answers with the given results in turn (false after).
 */
const buildPage = ( responses: Array< Response | null >, errorPages: boolean[] = [] ) => {
	const goto = jest.fn( async () => null as Response | null );
	for ( const response of responses ) {
		goto.mockResolvedValueOnce( response );
	}

	const evaluate = jest.fn( async () => false );
	for ( const errorPage of errorPages ) {
		evaluate.mockResolvedValueOnce( errorPage );
	}

	const page = {
		goto,
		evaluate,
		route: jest.fn( async () => undefined ),
		waitForTimeout: jest.fn( async () => undefined ),
	};

	return page;
};

describe( 'LoginPage.visit', () => {
	afterEach( () => {
		jest.restoreAllMocks();
	} );

	test.each( [ HTTP_BAD_GATEWAY, HTTP_SERVICE_UNAVAILABLE, HTTP_GATEWAY_TIMEOUT ] )(
		'backs off and navigates again after a %d',
		async ( status ) => {
			const ok = buildResponse( HTTP_OK );
			const page = buildPage( [ buildResponse( status ), ok ] );
			const warn = jest.spyOn( console, 'warn' ).mockImplementation( () => undefined );

			await expect( new LoginPage( page as unknown as Page ).visit() ).resolves.toBe( ok );

			expect( page.waitForTimeout.mock.calls ).toEqual( [ [ 5_000 ] ] );
			expect( page.goto ).toHaveBeenCalledTimes( 2 );
			expect( page.route ).toHaveBeenCalledTimes( 1 );
			expect( warn ).toHaveBeenCalledWith( expect.stringContaining( '1/4' ) );
		}
	);

	test( 'throws once every attempt returned a 502, waiting before each retry', async () => {
		const badGateway = buildResponse( HTTP_BAD_GATEWAY );
		const page = buildPage( [ badGateway, badGateway, badGateway, badGateway, badGateway ] );
		jest.spyOn( console, 'warn' ).mockImplementation( () => undefined );

		await expect( new LoginPage( page as unknown as Page ).visit() ).rejects.toThrow(
			/status 502\) after 4 attempts/
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
		const page = buildPage( [ buildResponse( HTTP_OK ), ok ], [ true ] );
		jest.spyOn( console, 'warn' ).mockImplementation( () => undefined );

		await expect( new LoginPage( page as unknown as Page ).visit() ).resolves.toBe( ok );

		expect( page.waitForTimeout.mock.calls ).toEqual( [ [ 5_000 ] ] );
		expect( page.goto ).toHaveBeenCalledTimes( 2 );
		// Transient-only: a 500 "Internal Server Error" page must not be retried.
		expect( page.evaluate ).toHaveBeenCalledWith( expect.any( Function ), true );
	} );

	test( 'retries a gateway-error page that came with no response', async () => {
		const ok = buildResponse( HTTP_OK );
		const page = buildPage( [ null, ok ], [ true ] );
		jest.spyOn( console, 'warn' ).mockImplementation( () => undefined );

		await expect( new LoginPage( page as unknown as Page ).visit() ).resolves.toBe( ok );

		expect( page.waitForTimeout.mock.calls ).toEqual( [ [ 5_000 ] ] );
		expect( page.goto ).toHaveBeenCalledTimes( 2 );
	} );

	test.each( [ HTTP_OK, HTTP_NOT_FOUND, HTTP_INTERNAL_SERVER_ERROR ] )(
		'returns a %d response without waiting or retrying',
		async ( status ) => {
			const response = buildResponse( status );
			const page = buildPage( [ response, buildResponse( HTTP_BAD_GATEWAY ) ] );

			await expect( new LoginPage( page as unknown as Page ).visit() ).resolves.toBe( response );

			expect( page.waitForTimeout ).not.toHaveBeenCalled();
			expect( page.goto ).toHaveBeenCalledTimes( 1 );
		}
	);

	test( 'returns a null response without waiting or retrying', async () => {
		const page = buildPage( [ null, buildResponse( HTTP_BAD_GATEWAY ) ] );

		await expect( new LoginPage( page as unknown as Page ).visit() ).resolves.toBeNull();

		expect( page.waitForTimeout ).not.toHaveBeenCalled();
		expect( page.goto ).toHaveBeenCalledTimes( 1 );
	} );
} );
