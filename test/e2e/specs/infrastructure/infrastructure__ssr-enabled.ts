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
				await page.locator( '#wpcom[data-calypso-ssr="true"]' ).waitFor( { timeout: 15 * 1000 } );
			} );
		}
	);
} );
