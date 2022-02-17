/**
 * @group calypso-pr
 */

import { DataHelper, SidebarComponent, SiteImportPage, TestAccount } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Site Import' ), function () {
	let siteImportPage: SiteImportPage;
	let page: Page;

	beforeAll( async () => {
		page = await browser.newPage();

		const testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page );
	} );

	it( 'Navigate to Tools > Import', async function () {
		const sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.navigate( 'Tools', 'Import' );
	} );

	it.each( SiteImportPage.services )( 'Select service provider: %s', async function ( service ) {
		siteImportPage = new SiteImportPage( page );
		await siteImportPage.selectService( service );
		await siteImportPage.verifyImporter( service );
		await siteImportPage.cancel();
	} );
} );
