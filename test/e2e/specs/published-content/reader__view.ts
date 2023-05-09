/**
 * @group calypso-pr
 * @group jetpack-remote-site
 */

import {
	DataHelper,
	TestAccount,
	ReaderPage,
	SecretsManager,
	TestAccountName,
	envVariables,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Reader: View' ), function () {
	let page: Page;
	let readerPage: ReaderPage;
	const user: TestAccountName =
		envVariables.JETPACK_TARGET === 'remote-site' ? 'jetpackRemoteSiteUser' : 'commentingUser';
	const expectedSiteName =
		envVariables.JETPACK_TARGET === 'remote-site'
			? SecretsManager.secrets.testAccounts.jetpackRemoteSiteUser.testSites?.primary.url
			: SecretsManager.secrets.otherTestSites.notifications;
	let testAccount: TestAccount;

	beforeAll( async function () {
		page = await browser.newPage();
		testAccount = new TestAccount( user );
		await testAccount.authenticate( page );
	} );

	it( 'View the Reader stream', async function () {
		readerPage = new ReaderPage( page );
		await readerPage.visit();
		const siteOfLatestPost = await readerPage.siteOfLatestPost();
		expect( siteOfLatestPost ).toEqual( expectedSiteName );
	} );

	it( 'Visit latest post', async function () {
		await readerPage.visitPost( { index: 1 } );
	} );
} );
