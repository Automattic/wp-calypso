/**
 * @group calypso-pr
 */

import { DataHelper, TestAccount } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

// Test suite for UserSettingsPage
describe( DataHelper.createSuiteTitle( 'User Settings' ), function () {
	let page: Page;

	describe( 'User Settings', function () {
		beforeAll( async () => {
			page = await browser.newPage();
			const testAccount = new TestAccount( 'defaultUser' );
			await testAccount.authenticate( page );
			await page.goto( `${ DataHelper.getCalypsoURL() }subscriptions/settings` );
		} );

		it( 'Click on the checkbox and it changes its value', async function () {
			await page.waitForSelector( 'input[type="checkbox"]' );
			const checkbox = await page.$( 'input[type="checkbox"]' );
			const checked = await checkbox?.isChecked();

			await page.click( 'input[type="checkbox"]' );

			const newChecked = await checkbox?.isChecked();
			expect( checked ).not.toBe( newChecked );
		} );
	} );
} );
