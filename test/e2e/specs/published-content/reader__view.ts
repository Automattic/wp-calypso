/**
 * @group calypso-pr
 * @group jetpack-remote-site
 */

import {
	DataHelper,
	TestAccount,
	ReaderPage,
	TestAccountName,
	envVariables,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Reader: View' ), function () {
	let page: Page;
	let readerPage: ReaderPage;
	const accountName: TestAccountName =
		envVariables.JETPACK_TARGET === 'remote-site' ? 'jetpackRemoteSiteUser' : 'commentingUser';
	let testAccount: TestAccount;

	beforeAll( async function () {
		page = await browser.newPage();
		testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Visit the Reader', async function () {
		readerPage = new ReaderPage( page );
		await readerPage.visit();
	} );

	it( 'Reader stream is present', async function () {
		await Promise.any( [
			page.getByRole( 'link', { name: 'Find sites to follow' } ),
			page.getByRole( 'main' ).getByRole( 'article' ),
		] );
	} );
} );
