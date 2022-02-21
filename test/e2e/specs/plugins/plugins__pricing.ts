/**
 * @group calypso-pr
 */

import { DataHelper, TestAccount, PluginsPage } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Plugins page pricing toggle' ), function () {
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
	} );

	it( 'Pricing toggle', async function () {
		await pluginsPage.checkMonthlyPricing();
		await pluginsPage.selectAnnualPricing();
		await pluginsPage.checkAnnualPricing();
		await pluginsPage.selectMonthlyPricing();
		await pluginsPage.checkMonthlyPricing();
	} );
} );
