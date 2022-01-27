/**
 * @group calypso-pr
 */

import { DataHelper } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Server-side Rendering' ), function () {
	let page: Page;

	beforeAll( async () => {
		page = await browser.newPage();
	} );

	it.each`
		endpoint
		${ DataHelper.getCalypsoURL( 'log-in' ) }
		${ DataHelper.getCalypsoURL( 'themes' ) }
		${ DataHelper.getCalypsoURL( 'theme/twentytwenty' ) }
	`( 'Check endpoint: $endpoint', async function ( { endpoint } ) {
		await page.goto( endpoint );
		await page.waitForSelector( '#wpcom[data-calypso-ssr="true"]' );
	} );
} );
