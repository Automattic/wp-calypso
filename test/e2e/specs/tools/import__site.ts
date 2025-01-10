/**
 * @group calypso-pr
 */

import { DataHelper, SiteImportPage, TestAccount } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Site Import' ), function () {
	let siteImportPage: SiteImportPage;
	let page: Page;

	const testAccount = new TestAccount( 'defaultUser' );
	const siteDomain = testAccount.getSiteURL( { protocol: false } );

	beforeAll( async () => {
		page = await browser.newPage();

		await testAccount.authenticate( page );
	} );

	it( 'Dismiss the Sites Guide and pick a site', async function () {
		try {
			// Wait for the Guide's close button to appear
			await page.waitForSelector(
				'button.components-button.is-small.has-icon[aria-label="Close"]'
			);
			// Dismiss the Sites guide
			await page.click( 'button.components-button.is-small.has-icon[aria-label="Close"]' );
			await page.isHidden( 'button.components-button.is-small.has-icon[aria-label="Close"]' );
		} catch ( e ) {
			// No guide was shown, continue
		}

		const calypsoSiteUrl = DataHelper.getCalypsoURL( `/home/${ siteDomain }` );
		await page.goto( calypsoSiteUrl );
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
