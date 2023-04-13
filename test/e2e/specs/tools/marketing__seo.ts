/**
 * @group calypso-pr
 */

import { DataHelper, SidebarComponent, MarketingPage, TestAccount } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Marketing: SEO Preview' ), function () {
	let marketingPage: MarketingPage;
	let page: Page;

	beforeAll( async () => {
		page = await browser.newPage();

		const testAccount = new TestAccount( 'atomicUser' );
		await testAccount.authenticate( page );
	} );

	it( 'Navigate to Tools > Marketing page', async function () {
		const sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.navigate( 'Tools', 'Marketing' );
	} );

	it( 'Click on Traffic tab', async function () {
		marketingPage = new MarketingPage( page );
		await marketingPage.clickTab( 'Traffic' );
	} );

	it( 'Enter SEO meta description', async function () {
		await marketingPage.enterWebsiteMetaInformation();
	} );

	it( 'Open and close SEO preview', async function () {
		await marketingPage.openSEOPreview();
		await marketingPage.closeSEOPreview();
	} );
} );
