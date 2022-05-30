/**
 * @group calypso-release
 */

import { DataHelper, GutenboardingFlow, TestAccount } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle( 'DIFM-Lite: Create WordPress.com paid site as an existing user.' ),
	function () {
		let testAccount: TestAccount;
		let page: Page;
		// let difmLite: DifmLiteFlow;
		let gutenboardingFlow: GutenboardingFlow;

		beforeAll( async function () {
			page = await browser.newPage();
			testAccount = new TestAccount( 'defaultUser' );
			await testAccount.authenticate( page );
		} );

		describe( 'Go to /start/do-it-for-me/new-or-existing-site as defaultUser', function () {
			it( 'Navigate to /start/do-it-for-me/user', async function () {
				await page.goto( DataHelper.getCalypsoURL( '/start/do-it-for-me/new-or-existing-site' ) );
			} );
			it( 'Step 1: Select an Existing WordPress.com site', async function () {
				// CHECK A PRICE IS SHOWING
				// CHECK THE PRICE IS IN AUD?
				gutenboardingFlow = new GutenboardingFlow( page );
				await gutenboardingFlow.clickButton( 'Select a site' );
			} );
			it( 'Step 2: Choose site to redo (delete)', async function () {
				const selectSiteByIcon = page.locator( '.site-icon >> nth=0 ' );
				await selectSiteByIcon.click();
				const deleteSiteContentButton = page.locator( '.button.css-1wd5qm6.edtv8x81.is-primary' );
				// await deleteSiteContentButton.isEnabled();
				const deletionWarningInput = page.locator( '#confirmTextChangeInput' );
				await deletionWarningInput.fill( 'DELETE' );
				// await deleteSiteContentButton.isEnabled();
				await deleteSiteContentButton.click();
			} );
			it( 'Step 3: Enter site name (skip tagline)', async function () {
				const siteTitleInput = page.locator( '#siteTitle ' );
				await siteTitleInput.fill( 'Test Site Name' );
				await gutenboardingFlow.clickButton( 'Continue' );
			} );
			it( 'Step 4: Continue on socials (enter no socials)', async function () {
				await gutenboardingFlow.clickButton( 'Continue' );
			} );
			it( 'Step 5: Select a theme.', async function () {
				const firstThemeChoice = page.locator( '.design-picker__design-option >> nth=0 ' );
				await firstThemeChoice.click();
			} );
			it( 'Step 6: Add 2 pages ontop of default.', async function () {
				await gutenboardingFlow.clickButton( 'Go to Checkout' );
			} );
			it( 'Confirm journey has resolved to the basket.', async function () {
				await page.locator( '.masterbar__secure-checkout' );
			} );
			it.skip( 'Pause at the end', async function () {
				await page.locator( '.siteSearch__input' ).press( 'Enter' );
			} );
		} );
	}
);
