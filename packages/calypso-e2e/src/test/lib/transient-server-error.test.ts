import { afterEach, describe, expect, test } from '@jest/globals';
import { isServerErrorPage, ServerErrorMatch } from '../../lib/transient-server-error';
import type { Page } from 'playwright';

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
		const page = buildPage( 'Log In — WordPress.com', 'Log in to your account' );

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
