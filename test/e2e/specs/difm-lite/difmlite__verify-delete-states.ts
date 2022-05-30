/**
 * @group difmlite-pr
 */

import { DataHelper, GutenboardingFlow, DifmLiteFlow, TestAccount } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe.skip(
	DataHelper.createSuiteTitle( 'DIFM-Lite: Verify site deletion journey.' ),
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
		} );
	}
);
