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
		/**
		 * Temporarily disabled sidebar code due to the Untangling Calypso & Nav Redesign project.
		 * Awaiting final UI design.
		 * @see https://github.com/Automattic/wp-calypso/pull/87477
		 */
		page.goto(
			DataHelper.getCalypsoURL( `import/${ testAccount.getSiteURL( { protocol: false } ) }` )
		);
		// const sidebarComponent = new SidebarComponent( page );
		// await sidebarComponent.navigate( 'Tools', 'Import' );
	} );

	it.each( SiteImportPage.services )( 'Select service provider: %s', async function ( service ) {
		siteImportPage = new SiteImportPage( page );
		await siteImportPage.selectService( service );
		await siteImportPage.verifyImporter( service );
		await siteImportPage.cancel();
	} );
} );
