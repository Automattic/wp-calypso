/**
 * @group calypso-pr
 */

import { DataHelper, SidebarComponent, MarketingPage, TestAccount } from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'SEO Preview Page' ), function () {
	let marketingPage;
	let page;

	beforeAll( async () => {
		page = await global.browser.newPage();

		const testAccount = new TestAccount( 'eCommerceUser' );
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
