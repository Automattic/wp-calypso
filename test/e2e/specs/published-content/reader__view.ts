/**
 * @group calypso-pr
 */

import { DataHelper, TestAccount, ReaderPage, SecretsManager } from '@automattic/calypso-e2e';
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

	it( 'View the Reader stream', async function () {
		readerPage = new ReaderPage( page );
		const testSiteForNotifications = SecretsManager.secrets.otherTestSites.notifications;
		const siteOfLatestPost = await readerPage.siteOfLatestPost();
		expect( siteOfLatestPost ).toEqual( testSiteForNotifications );
	} );

	it( 'Visit latest post', async function () {
		await readerPage.visitPost( { index: 1 } );
	} );
} );
