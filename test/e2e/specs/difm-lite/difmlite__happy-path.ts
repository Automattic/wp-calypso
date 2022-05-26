/**
 * @group calypso-release
 */

import {
	DataHelper,
	// CloseAccountFlow,
	// GutenboardingFlow,
	// DifmliteFlow,
	// FullSiteEditorPage,
	// SecretsManager,
	TestAccount,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Gutenboarding: Create' ), function () {
	let testAccount: TestAccount;
	let page: Page;

	beforeAll( async function () {
		page = await browser.newPage();
		testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page );
	} );

	describe( 'Go to /start/do-it-for-me/new-or-existing-site as defaultUser', function () {
		it( 'Navigate to /start/do-it-for-me/user', async function () {
			await page.goto( DataHelper.getCalypsoURL( '/start/do-it-for-me/new-or-existing-site' ) );
			await page.locator( '.siteSearch__input' ).press( 'Enter' );
		} );

		// Step through new site journey
	} );
} );
