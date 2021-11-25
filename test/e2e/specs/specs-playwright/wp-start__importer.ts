/**
 * @group calypso-pr
 */

import { DataHelper, LoginPage, setupHooks, StartImportFlow } from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Site Import' ), function () {
	let page: Page;
	let startImportFlow: StartImportFlow;

	setupHooks( ( args ) => {
		page = args.page;
		startImportFlow = new StartImportFlow( page );
	} );

	// Login in default page
	it( 'Log in', async function () {
		const loginPage = new LoginPage( page );
		await loginPage.login( { account: 'defaultUser' } );
	} );

	// A normal and valid import flow
	describe( 'Follow the import flow', function () {
		it( 'Navigate to Setup page', async function () {
			await startImportFlow.startSetup( 'e2eflowtesting4.wordpress.com' );
			await startImportFlow.validateURLCapturePage();
		} );

		it( 'Start a WordPress import', async () => {
			await startImportFlow.enterURL( 'make.wordpress.org' );
			await startImportFlow.validateScanningPage();
			await startImportFlow.validateImportPage();
		} );
	} );

	// An import flow that redirect to a page that
	describe.each( [
		{ url: 'wordpress.com', reason: 'Your site is already on WordPress.com' },
		{ url: 'example.com', reason: 'Your existing content can\'t be imported' },
	] )( 'Follow the WordPress can\'t be imported flow', function ( { url, reason } ) {
		it( `Navigate to Capture page`, async function () {
			await startImportFlow.startImport( 'e2eflowtesting4.wordpress.com' );
			await startImportFlow.validateURLCapturePage();
		} );

		it( `Start an invalid WordPress import (${ reason })`, async () => {
			await startImportFlow.enterURL( url );
			await startImportFlow.validateScanningPage();
			await startImportFlow.validateBuildingPage( reason );
			await startImportFlow.startBuilding();
			await startImportFlow.validateDesignPage();
		} );
	} );

	describe( 'Follow the WordPress domain error flow', function ( ) {
		it( `Navigate to Capture page`, async function () {
			await startImportFlow.startImport( 'e2eflowtesting4.wordpress.com' );
			await startImportFlow.validateURLCapturePage();
		} );

		// One of several errors found on Blogs::get_blog_name_error_code
		// A deleted wpcom site does generate the same error
		it( `Start an invalid WordPress import typo`, async () => {
			await startImportFlow.enterURL( '1.example.com' );
			await startImportFlow.validateScanningPage();
			await startImportFlow.validateErrorCapturePage( 'The address you entered is not valid. Please try again.' );
		} );
	} );
} );
