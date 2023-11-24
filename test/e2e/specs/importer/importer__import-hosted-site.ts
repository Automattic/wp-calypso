/**
 * @group calypso-pr
 */
import { DataHelper, StartImportFlow, TestAccount } from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';
import type { TestAccountName } from '@automattic/calypso-e2e';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Stepper: setup/import-hosted-site' ), () => {
	let page: Page;
	let startImportFlow: StartImportFlow;

	beforeAll( async () => {
		page = await browser.newPage();
		startImportFlow = new StartImportFlow( page );
	} );

	const loginAsUser = ( user: TestAccountName ) => {
		it( `Login as ${ user }`, async () => {
			const testAccount = new TestAccount( user );
			await testAccount.authenticate( page );
		} );
	};

	const navigateToImportHostedSiteFlow = ( step: string, siteSlug?: string, from?: string ) => {
		it( `Navigate to page setup/import-hosted`, async () => {
			await startImportFlow.startImportHostedSite( step, siteSlug ?? '', from ?? '' );
		} );
	};

	describe( 'Scenario: Run import flow without init knowing the source and target site', () => {
		loginAsUser( 'defaultUser' );
		navigateToImportHostedSiteFlow( 'import' );

		it( 'Enter make.wordpress.org', async () => {
			await startImportFlow.enterURL( 'make.wordpress.org' );
		} );

		it( 'Should render "Site Picker" screen', async () => {
			await startImportFlow.validateSitePickerPage();
		} );

		it( 'Should select the first site', async () => {
			await page.locator( 'button:text("Select this site")' ).nth( 0 ).click();
			await startImportFlow.clickButton( 'Continue' );
		} );

		it( 'Should render "Upgrade Plan" screen', async () => {
			await startImportFlow.validateUpgradePlanPage();
		} );
	} );
} );
