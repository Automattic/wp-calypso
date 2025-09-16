/**
 * @group calypso-release
 */

import { DataHelper } from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';
import { expect } from '../../lib/pw-base';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Signup: WordPress.com TOS' ), function () {
	let page: Page;

	beforeAll( async () => {
		page = await browser.newPage();
	} );

	it( 'Visit signup page', async function () {
		await page.goto( DataHelper.getCalypsoURL( '/setup/onboarding' ) );

		await expect(
			page.getByText(
				// WARNING! Please contact the legal team if this text changes!
				'By continuing with any of the options listed, you agree to our Terms of Service and have read our Privacy Policy.'
			)
		).toBeVisible();
	} );
} );
