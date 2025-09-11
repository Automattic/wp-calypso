/**
 * @group authentication
 */

import { LoginPage } from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';
import { expect } from '../../lib/pw-base';

declare const browser: Browser;

describe( 'Authentication: Verify TOS', function () {
	let page: Page;
	let loginPage: LoginPage;

	beforeAll( async () => {
		page = await browser.newPage();
	} );

	it( 'Navigate to /login', async function () {
		loginPage = new LoginPage( page );
		await loginPage.visit();

		await page.waitForURL( /log-in/ );

		await expect(
			page.getByText(
				// WARNING! Please contact the legal team if this text changes!
				'Just a little reminder that by continuing with any of the options below, you agree to our Terms of Service and Privacy Policy.'
			)
		).toBeVisible();
	} );
} );
