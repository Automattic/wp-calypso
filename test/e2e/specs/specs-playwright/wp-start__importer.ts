/**
 * @group calypso-pr
 */

import { setupHooks, DataHelper, LoginPage, StartImportFlow } from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Site Import' ), function () {
	let page: Page;
	let startImportFlow: StartImportFlow;

	setupHooks( ( args ) => {
		page = args.page;
		startImportFlow = new StartImportFlow( page );
	} );

	it( 'Log in', async function () {
		const loginPage = new LoginPage( page );
		await loginPage.login( { account: 'defaultUser' } );
	} );

	describe( 'Follow the WordPress flow', function () {
		it( 'Navigate to Capture page', async function () {
			await page.goto(
				DataHelper.getCalypsoURL( '/start/importer', { siteSlug: 'e2eflowtesting4.wordpress.com' } )
			);
			await startImportFlow.validateURLCapturePage();
		} );

		it( 'Start a WordPress import', async () => {
			await startImportFlow.enterURL( 'make.wordpress.org' );
			await startImportFlow.validateScanningPage();
			await startImportFlow.validateImportPage();
		} );
	} );
} );
