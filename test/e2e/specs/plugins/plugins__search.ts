/**
 * @group calypso-pr
 */

import { DataHelper, TestAccount, PluginsPage } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Plugins search' ), function () {
	let page: Page;
	let pluginsPage: PluginsPage;
	let siteUrl: string;

	beforeAll( async () => {
		page = await browser.newPage();
		const testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page );
		siteUrl = testAccount.getSiteURL( { protocol: false } );
	} );

	it( 'Visit plugins page', async function () {
		pluginsPage = new PluginsPage( page );
		await pluginsPage.visit( siteUrl );
	} );

	it( 'Search for ecommerce', async function () {
		await pluginsPage.search( 'ecommerce' );
		await pluginsPage.validateExpectedSearchResultFound( 'WooCommerce' );
	} );
} );
