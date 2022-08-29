/**
 * @group calypso-pr
 */

import { DataHelper, TestAccount, PluginsPage } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Plugins search' ), function () {
	let page: Page;
	let pluginsPage: PluginsPage;

	beforeAll( async () => {
		page = await browser.newPage();
		const testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page );
	} );

	it( 'Visit plugins page', async function () {
		pluginsPage = new PluginsPage( page );
		await pluginsPage.visit();
		// Ensure page is wide enough to show the breadcrumb details
		await page.setViewportSize( { width: 1300, height: 1080 } );
	} );

	it( 'Search for ecommerce', async function () {
		await pluginsPage.search( 'ecommerce' );
		await pluginsPage.validateExpectedSearchResultFound( 'WooCommerce' );
	} );

	it( 'Can click on search result', async function () {
		await pluginsPage.clickSearchResult( 'WooCommerce' );
		await pluginsPage.validatePluginDetailsHasHeaderTitle( 'WooCommerce' );
	} );

	it( 'Can click on breadcrumbs "Plugins"', async function () {
		await pluginsPage.clickPluginsBreadcrumb();
	} );
} );
