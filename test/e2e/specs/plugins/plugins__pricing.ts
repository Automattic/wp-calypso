/**
 * @group calypso-pr
 */

import { DataHelper, TestAccount, PluginsPage } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Plugins page pricing toggle' ), function () {
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
		await pluginsPage.validateIsMonthlyPricing();
	} );

	it( 'Toggle pricing to annual', async function () {
		await pluginsPage.selectAnnualPricing();
		await pluginsPage.validateIsAnnualPricing();
	} );
	it( 'Toggle pricing back to monthly', async function () {
		await pluginsPage.selectMonthlyPricing();
		await pluginsPage.validateIsMonthlyPricing();
	} );
} );
