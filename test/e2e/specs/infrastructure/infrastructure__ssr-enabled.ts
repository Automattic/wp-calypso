/**
 * @group calypso-loop
 */

import { DataHelper } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Server-side Rendering' ), function () {
	let page: Page;

	beforeAll( async () => {
		page = await browser.newPage();
	} );

	describe.each`
		endpoint
		${ 'log-in' }
		${ 'themes' }
		${ 'theme/twentytwentythree' }
	`( 'Check SSR endoint: $endpoint', function ( { endpoint } ) {
		it( 'Navigate to $endpoint', async function () {
			await page.goto( endpoint, { timeout: 20 * 1000 } );
		} );

		it( 'SSR is present for $endpoint', async function () {
			await page.locator( '#wpcom[data-calypso-ssr="true"]' ).waitFor( { timeout: 15 * 1000 } );
		} );
	} );
} );
