/**
 * @group calypso-pr
 */

import { DataHelper, SiteImportPage, TestAccount } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Site Import' ), function () {
	let siteImportPage: SiteImportPage;
	let page: Page;
	let testAccount: TestAccount;

	beforeAll( async () => {
		page = await browser.newPage();

		testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page );
	} );

	it( 'Navigate to Tools > Import', async function () {
		page.goto(
			DataHelper.getCalypsoURL( `import/${ testAccount.getSiteURL( { protocol: false } ) }` )
		);
	} );

	it.each( SiteImportPage.services )( 'Select service provider: %s', async function ( service ) {
		if ( service === 'WordPress' ) {
			return;
		}
		siteImportPage = new SiteImportPage( page );
		await siteImportPage.selectService( service );
		await siteImportPage.verifyImporter( service );
		await siteImportPage.cancel();
	} );

	// Extracted from the generic "Select service provider: %s" and skipped due to a new migration flow changes.
	// More context on Automattic/wp-calypso/pull/90994
	it.skip( 'Select service provider: WordPress', async function () {
		siteImportPage = new SiteImportPage( page );
		await siteImportPage.selectService( 'WordPress' );
		await siteImportPage.verifyImporter( 'WordPress' );
		await siteImportPage.cancel();
	} );
} );
