/**
 * @group calypso-pr
 */

import { DataHelper, TestAccount, PluginsPage } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'WooCommerce Landing Page' ), function () {
	let page: Page;
	let pluginsPage: PluginsPage;
	let siteUrl: string;

	beforeAll( async () => {
		page = await browser.newPage();

		const testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page );
		siteUrl = testAccount.getSiteURL( { protocol: false } );
	} );

	it( 'Plugins page loads premium,featured,popular,new sections', async function () {
		pluginsPage = new PluginsPage( page );
		await pluginsPage.visit( `/plugins/${ siteUrl }` );
		await pluginsPage.hasSection( 'Premium' );
		await pluginsPage.hasSection( 'Featured' );
		await pluginsPage.hasSection( 'Popular' );
		await pluginsPage.hasSection( 'New' );
	} );
} );
