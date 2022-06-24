/**
 * @group calypso-release
 */

import {
	DataHelper,
	MeSidebarComponent,
	NavbarComponent,
	TestAccount,
} from '@automattic/calypso-e2e';
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

	it( 'Navigate to /me', async function () {
		const navbarComponent = new NavbarComponent( page );
		await navbarComponent.clickMe();
	} );

	it( 'Log out', async function () {
		const meSidebarComponent = new MeSidebarComponent( page );
		await meSidebarComponent.clickLogout();
	} );
} );
