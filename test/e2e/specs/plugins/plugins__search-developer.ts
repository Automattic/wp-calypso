/**
 * @group calypso-pr
 */

import { DataHelper, TestAccount, PluginsPage } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Plugins search developer' ), function () {
	let page: Page;
	let pluginsPage: PluginsPage;

	beforeAll( async () => {
		page = await browser.newPage();
		const testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page );
	} );

	it( 'Visit Yoast plugin page', async function () {
		pluginsPage = new PluginsPage( page );
		await pluginsPage.visitPage( 'wordpress-seo-premium' );
	} );

	it( 'Developer shows up in search term', async function () {
		await pluginsPage.clickDeveloperLink();
		await pluginsPage.validateExpectedSearchResultFound( 'Yoast SEO Premium' );
		await pluginsPage.validateSearchInputValue( 'developer:"yoast"' );
	} );
} );
