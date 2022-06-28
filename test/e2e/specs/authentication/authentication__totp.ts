/**
 * @group calypso-release
 */

import { DataHelper, TestAccount } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Authentication: TOTP' ), function () {
	let page: Page;
	let testAccount: TestAccount;

	beforeAll( async () => {
		page = await browser.newPage();
	} );

	it( 'Authenticate as user with TOTP 2FA code', async function () {
		testAccount = new TestAccount( 'totpUser' );
		await testAccount.authenticate( page );
	} );
} );
