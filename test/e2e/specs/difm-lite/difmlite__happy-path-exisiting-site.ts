/**
 * @group calypso-release
 */

import { DataHelper, GutenboardingFlow, DifmLiteFlow, TestAccount } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle(
		'DIFM-Lite: Create a new WordPress.com paid site over writting an existing site.'
	),
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
				await gutenboardingFlow.clickButton( 'Select a site' );
			} );
			it( 'Step 2: Choose site to redo (delete)', async function () {
				// Selects a site to delete, first is default.
				await difmLite.selectASite();

				// Validate button inactive.
				// const confirmSiteDeleteButton = page.locator( difmLite.selectors.confirmSiteDeleteButton );
				const confirmSiteDeleteButton = page.locator(
					'difmLite.selectors.confirmSiteDeleteButton'
				);
				await expect( confirmSiteDeleteButton.isDisabled );

				// Fills in confirmation input (by default it will enter a valid input).
				await difmLite.fillDeleteConfirmationField();

				// Validate button active.
				const confirmSiteDeleteButtonSteve = page.locator(
					'difmLite.selectors.confirmSiteDeleteButton'
				);
				await expect( confirmSiteDeleteButtonSteve.isDisabled );

				// Attempts to click the 'Delete site content' button.
				await difmLite.clickDeleteConfirmation();
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
				await difmLite.checkForCheckout();
			} );
		} );
	}
);
