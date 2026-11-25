/**
 * @vitest-environment jsdom
 */
import { vi } from 'vitest';
import { createSitePreviewScreenshot } from '../mshot';

describe( 'createSitePreviewScreenshot', () => {
	afterEach( () => {
		vi.unstubAllGlobals();
	} );

	it( 'asks mShots for the desktop capture the site checks show', () => {
		// nock's interceptor wraps each request in a proxy that handles `send()` itself, so a spy on
		// the prototype's `send()` isn't called.
		const open = vi.fn();
		const send = vi.fn();
		vi.stubGlobal(
			'XMLHttpRequest',
			vi.fn( function () {
				return { open, send };
			} )
		);

		createSitePreviewScreenshot( 'https://example.com' );

		expect( open ).toHaveBeenCalledWith(
			'GET',
			'https://s0.wp.com/mshots/v1/https%3A%2F%2Fexample.com?vpw=1440&vph=1440&w=1440&h=1462&screen_height=1440&scale=2'
		);
		expect( send ).toHaveBeenCalledTimes( 1 );
	} );
} );
