/**
 * @group calypso-release
 */

import { DataHelper, TestAccount } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Authentication: SMS 2FA' ), function () {
	let page: Page;
	let testAccount: TestAccount;

	beforeAll( async function () {
		page = await browser.newPage();
	} );

	it( 'Authenticate as user with SMS 2FA code', async function () {
		testAccount = new TestAccount( 'smsUser' );
		await testAccount.authenticate( page );
	} );

	it( 'User lands in /home', async function () {
		await page.waitForURL( /.*\/home\/.*/ );
	} );
} );
