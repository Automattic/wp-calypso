/**
 * @group calypso-pr
 */

import { DataHelper, TestAccount, ReaderPage } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Reader: View' ), function () {
	let page: Page;
	let readerPage: ReaderPage;
	let testAccount: TestAccount;

	beforeAll( async function () {
		page = await browser.newPage();

		testAccount = new TestAccount( 'commentingUser' );
		await testAccount.authenticate( page );
	} );

	it( 'Visit latest post', async function () {
		readerPage = new ReaderPage( page );
		await readerPage.visitPost( 'A new post for commenting' );
	} );
} );
