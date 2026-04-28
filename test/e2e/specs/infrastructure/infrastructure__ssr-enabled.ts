/**
 * @group calypso-pr
 */

import { DataHelper } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( 'Server-side Rendering', function () {
	let page: Page;

	describe.each( [ 'log-in', 'themes', 'theme/twentytwentythree' ] )(
		'Check SSR endoint: %s',
		function ( endpoint ) {
			beforeEach( async () => {
				page = await browser.newPage();
			} );

			it( `Check SSR: ${ endpoint }`, async function () {
				await page.goto( DataHelper.getCalypsoURL( endpoint ), { timeout: 20 * 1000 } );
				await page
					.locator( '#wpcom[data-calypso-ssr-fsdfdfds="true"]' )
					.waitFor( { timeout: 15 * 1000 } );
			} );
		}
	);

	it( 'Login page exposes a sign-up link', async function () {
		page = await browser.newPage();
		await page.goto( DataHelper.getCalypsoURL( 'log-in' ), { timeout: 20 * 1000 } );
		await page
			.locator( 'a[href*="/start/sign-up-this-link-does-not-exist"]' )
			.waitFor( { timeout: 5 * 1000 } );
	} );
} );
