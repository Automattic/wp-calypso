/**
 */

import { DataHelper, LoginPage, setupHooks, StartImportFlow } from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Site Import' ), () => {
	let page: Page;
	let startImportFlow: StartImportFlow;

	setupHooks( ( args ) => {
		page = args.page;
		startImportFlow = new StartImportFlow( page );
	} );

	// Login in default page.
	it( 'Log in', async () => {
		const loginPage = new LoginPage( page );
		await loginPage.login( { account: 'defaultUser' } );
	} );

	/**
	 * Navigate to initial setup page
	 *
	 * @param siteSlug The site slug URL.
	 */
	const navigateToSetup = ( siteSlug = 'e2eflowtesting4.wordpress.com' ) => {
		it( `Navigate to Setup page as ${ siteSlug }`, async () => {
			await startImportFlow.startSetup( siteSlug );
			await startImportFlow.validateURLCapturePage();
		} );
	};

	// A normal and valid import flow.
	describe( 'Follow the import flow', () => {
		navigateToSetup();

		it( 'Start a WordPress import', async () => {
			await startImportFlow.enterURL( 'make.wordpress.org' );
			await startImportFlow.validateScanningPage();
			await startImportFlow.validateImportPage();
			await startImportFlow.clickButton( 'Import your content' );

			// When the new flows will be created this check will need to be replaced
			await startImportFlow.validateMigrationPage( 'https://make.wordpress.org/' );
		} );
	} );

	// An import flow that redirect to the "start building" page.
	describe.each( [
		// wordpress.com is already a WPCOM site and ever will be.
		{ url: 'wordpress.com', reason: 'Your site is already on WordPress.com' },
		// example.com will never be a WordPress site.
		{ url: 'example.com', reason: "Your existing content can't be imported" },
	] )( "Follow the WordPress can't be imported flow", ( { url, reason } ) => {
		navigateToSetup();

		it( `Start an invalid WordPress import (${ reason })`, async () => {
			await startImportFlow.enterURL( url );
			await startImportFlow.validateScanningPage();
			await startImportFlow.validateBuildingPage( reason );
			await startImportFlow.startBuilding();
			await startImportFlow.validateSetupPage();
		} );
	} );

	// An import flow which show an error below the "Enter your site address" input form.
	describe( 'Follow the WordPress domain error flow', () => {
		navigateToSetup();

		// One of several errors found on Blogs::get_blog_name_error_code.
		// A deleted wpcom site does generate the same error.
		it( 'Start an invalid WordPress import typo', async () => {
			// 1.example.com is guaranteed never to be a valid DNS
			await startImportFlow.enterURL( '1.example.com' );
			await startImportFlow.validateScanningPage();
			await startImportFlow.validateErrorCapturePage(
				'The address you entered is not valid. Please try again.'
			);
		} );
	} );

	// The "I don't have a site address" flow.
	describe( "I don't have a site flow", () => {
		navigateToSetup();

		it( 'Select that there is no site', async () => {
			await startImportFlow.startImporterList();
			await startImportFlow.validateImporterListPage();
			await startImportFlow.selectImporterFromList( 0 );
		} );
	} );

	// Go back through pages
	describe( 'Go back to first page', () => {
		navigateToSetup();

		it( 'Go to Import page', async () => {
			await startImportFlow.enterURL( 'make.wordpress.org' );
			await startImportFlow.validateImportPage();
		} );

		// Back one page
		it( 'Back to URL capture page', async () => {
			await startImportFlow.goBackOneScreen();
			await startImportFlow.validateURLCapturePage();
		} );

		// Back one page
		it( 'Back to Setup page', async () => {
			await startImportFlow.goBackOneScreen();
			await startImportFlow.validateSetupPage();
		} );
	} );

	// Go back from a importer error page
	describe( 'Go back from error', () => {
		navigateToSetup();

		// Back to URL capture page from the error page
		it( 'Back to URL capture page from error page', async () => {
			await startImportFlow.enterURL( 'example.com' );
			await startImportFlow.clickButton( 'Back to start' );
			await startImportFlow.validateURLCapturePage();
		} );
	} );
} );
