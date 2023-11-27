/**
 * @group calypso-pr
 */

import {
	DataHelper,
	StartImportFlow,
	TestAccount,
	SecretsManager,
	envVariables,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';
import type { TestAccountName } from '@automattic/calypso-e2e';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Stepper: setup/import-focused' ), () => {
	const credentials = {
		simpleSiteFreePlanUser: SecretsManager.secrets.testAccounts.simpleSiteFreePlanUser,
		jetpackRemoteSiteUser: SecretsManager.secrets.testAccounts.jetpackRemoteSiteUser,
	};

	let page: Page;
	let startImportFlow: StartImportFlow;

	console.log( 'envVariables', envVariables );

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

	const navigateToImportFocusedFlow = ( step: string, siteSlug?: string, from?: string ) => {
		it( `Navigate to page setup/import-focused?from=${ from }`, async () => {
			await startImportFlow.startImportFocused( step, siteSlug ?? '', from ?? '' );
		} );
	};

	describe( 'Scenario: from `self-hosted` (without JP) to `simple` site', () => {
		const user = 'simpleSiteFreePlanUser';

		loginAsUser( user );
		navigateToImportFocusedFlow( 'import', credentials[ user ].testSites?.primary?.url as string );

		it( 'Enter make.wordpress.org', async () => {
			await startImportFlow.enterURL( 'make.wordpress.org' );
		} );

		it( 'Should render "Upgrade Plan" screen', async () => {
			await startImportFlow.validateUpgradePlanPage();
		} );

		it( 'Should render "Install Jetpack" screen', async () => {
			await startImportFlow.clickButton( 'Upgrade and migrate' );
			await startImportFlow.validateInstallJetpackPage();
		} );
	} );

	describe( 'Scenario: from `self-hosted` (JP connected) to `simple` site', () => {
		const user = 'jetpackRemoteSiteUser';
		const sourceSiteUrl = credentials[ user ]?.testSites?.primary?.url as string;
		const targetSiteUrl = 'e2eimportflowtesting.wordpress.com';

		loginAsUser( user );
		navigateToImportFocusedFlow( 'import', targetSiteUrl );

		it( `Enter jetpack connected source site: ${ sourceSiteUrl }`, async () => {
			await startImportFlow.enterURL( sourceSiteUrl );
		} );

		it( 'Should render "Upgrade Plan" screen', async () => {
			await startImportFlow.validateUpgradePlanPage();
		} );

		it( 'Should redirect to "Checkout" page', async () => {
			await startImportFlow.clickButton( 'Upgrade and migrate' );
			await startImportFlow.validateCheckoutPage();
		} );
	} );

	describe( 'Scenario: Move to WPCOM plugin: from `self-hosted` to `simple` site', () => {
		const user = 'jetpackRemoteSiteUser';
		const sourceSiteUrl = credentials[ user ]?.testSites?.primary?.url as string;

		loginAsUser( user );
		navigateToImportFocusedFlow( 'migrationHandler', '', sourceSiteUrl );

		// it( 'Should render "Site Picker" screen', async () => {
		// 	await startImportFlow.validateSitePickerPage();
		// } );
		//
		// it( 'Should select the second site and press `Continue` on modal prompt', async () => {
		// 	await page.locator( 'button:text("Select this site")' ).nth( 0 ).click();
		// 	await startImportFlow.clickButton( 'Continue' );
		// } );

		it( 'Should render "Upgrade Plan" screen', async () => {
			await startImportFlow.validateUpgradePlanPage();
		} );
	} );
} );
