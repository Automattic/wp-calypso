/**
 * @group calypso-pr
 */

import { DataHelper, StartImportFlow, TestAccount, SecretsManager } from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Importer: Site Setup' ), () => {
	const credentials = SecretsManager.secrets.testAccounts.defaultUser;

	let page: Page;
	let startImportFlow: StartImportFlow;

	beforeAll( async () => {
		page = await browser.newPage();
		startImportFlow = new StartImportFlow( page );

		const testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page );
	} );

	/**
	 * Navigate to initial setup page.
	 *
	 * @param siteSlug The site slug URL.
	 */
	const navigateToSetup = ( siteSlug: string ) => {
		it( `Navigate to Setup page as ${ siteSlug }`, async () => {
			await startImportFlow.startSetup( siteSlug );
			await startImportFlow.validateURLCapturePage();
		} );
	};

	// WordPress content-only flow
	describe( 'Follow the WordPress import flow', () => {
		navigateToSetup( credentials.testSites?.primary?.url as string );

		it( 'Start a content-only WordPress import', async () => {
			await startImportFlow.enterURL( 'make.wordpress.org' );
			await startImportFlow.validateImporterDragPage( 'wordpress' );
		} );

		it( 'Back shows the URL capture form', async () => {
			await startImportFlow.clickBack();
			await startImportFlow.validateURLMigrationFlow();
		} );
	} );

	// An import flow that redirect to the "start building" page.
	describe.each( [
		// wordpress.com is already a WPCOM site and ever will be.
		{ url: 'wordpress.com', reason: 'Your site is already on WordPress.com' },
		// gravatar.com is not a WordPress site.
		{ url: 'gravatar.com', reason: "Your existing content can't be imported" },
	] )( "Follow the WordPress can't be imported flow", ( { url, reason } ) => {
		navigateToSetup( credentials.testSites?.primary?.url as string );

		it( `Start an invalid WordPress import on ${ url } (${ reason })`, async () => {
			await startImportFlow.enterURL( url );
			await startImportFlow.validateBuildingPage( reason );
			await startImportFlow.startBuilding();
			await startImportFlow.validateSetupPage();
		} );
	} );

	// An import flow which show an error below the "Enter your site address" input form.
	describe( 'Follow the WordPress domain error flow', () => {
		navigateToSetup( credentials.testSites?.primary?.url as string );

		// One of several errors found on Blogs::get_blog_name_error_code.
		// A deleted wpcom site does generate the same error.
		it( 'Start an invalid WordPress import typo', async () => {
			// 1.gravatar.com is guaranteed never to be a valid DNS
			await startImportFlow.enterURL( 'zz.gravatar.com' );

			// Support both Legacy and Goals Capture versions
			// of the error message.
			// See https://github.com/Automattic/wp-calypso/issues/65792
			await Promise.race( [
				startImportFlow.validateErrorCapturePage(
					'The address you entered is not valid. Please try again.'
				),
				startImportFlow.validateErrorCapturePage(
					'Please enter a valid website address. You can copy and paste.'
				),
			] );
		} );
	} );

	// Blogger, Medium, Squarespace
	describe( 'Follow the import file flow', () => {
		navigateToSetup( credentials.testSites?.primary?.url as string );

		it( 'Start a valid import file', async () => {
			await startImportFlow.enterURL( 'https://squarespace.com' );
			await startImportFlow.validateImportPage();
			await startImportFlow.clickButton( 'Import your content' );
			await startImportFlow.validateImporterDragPage( 'squarespace' );
		} );
	} );

	// The "I don't have a site address" flow.
	describe( "I don't have a site flow", () => {
		navigateToSetup( credentials.testSites?.primary?.url as string );

		it( 'Select that there is no site', async () => {
			await startImportFlow.startImporterList();
			await startImportFlow.validateImporterListPage();
			await startImportFlow.selectImporterFromList( 0 );
		} );
	} );

	// Go back from a importer error page.
	describe( 'Go back from error', () => {
		navigateToSetup( credentials.testSites?.primary?.url as string );

		// Back to URL capture page from the error page
		it( 'Back to URL capture page from error page', async () => {
			await startImportFlow.enterURL( 'gravatar.com' );
			await startImportFlow.clickButton( 'Back to start' );
			await startImportFlow.validateURLCapturePage();
		} );
	} );
} );
