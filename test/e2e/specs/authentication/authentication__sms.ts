/**
 * @group calypso-release
 *
 * One possible problem with this spec is that SMS OTP can only be requested once per minute.
 * In addition, anecdotally it appears that any login attempt during this one-minute blackout period resets the timer, though this isn't confirmed.
 * What this means is that in rare cases where Pre-Release Tests are lined up one after another in the queue, it may result in an unexpected failure of this spec, which would appear to be a flaky test failure to the developer.
 *
 * It may be necessary to keep a close eye on this test and immediately pull the test from rotation if we find the flakiness exceeds an acceptable level.
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
