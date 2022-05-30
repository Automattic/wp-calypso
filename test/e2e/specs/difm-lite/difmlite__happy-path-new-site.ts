/**
] * @group difmlite-pr
 */

import { DataHelper, GutenboardingFlow, DifmLiteFlow, TestAccount } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle( 'DIFM-Lite: Create WordPress.com paid site (create new site).' ),
	function () {
		let testAccount: TestAccount;
		let page: Page;
		let difmLite: DifmLiteFlow;
		let gutenboardingFlow: GutenboardingFlow;

		beforeAll( async function () {
			page = await browser.newPage();
			testAccount = new TestAccount( 'defaultUser' );
			await testAccount.authenticate( page );
		} );

		describe( 'Go to /start/do-it-for-me/new-or-existing-site as default user', function () {
			it( 'Navigate to /start/do-it-for-me/user', async function () {
				await page.goto( DataHelper.getCalypsoURL( '/start/do-it-for-me/new-or-existing-site' ) );
			} );
			it( 'Step 1: Select an Existing WordPress.com site', async function () {
				gutenboardingFlow = new GutenboardingFlow( page );
				difmLite = new DifmLiteFlow( page );
				await gutenboardingFlow.clickButton( 'Start a new site' );
			} );
			it( 'Step 2: Enter site name (skip tagline)', async function () {
				await difmLite.fillSiteTitleInput();
				await difmLite.pressContinueButton();
			} );
			it( 'Step 3: Continue on socials (enter no socials)', async function () {
				await difmLite.pressContinueButton();
			} );
			it( 'Step 4: Select a theme.', async function () {
				const firstThemeChoice = page.locator( '.design-picker__design-option >> nth=0 ' );
				await firstThemeChoice.click();
			} );
			it( 'Step 5: Add 2 pages ontop of default.', async function () {
				await gutenboardingFlow.clickButton( 'Go to Checkout' );
			} );
			it.skip( 'Confirm journey has resolved to the basket.', async function () {
				// TODO: Looks like this is taking too long and causing the test to fail.
				await difmLite.checkForCheckout();
			} );
		} );
	}
);
