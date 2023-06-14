/**
 * @group calypso-pr
 */

import { DataHelper, SecretsManager, StartImportFlow, TestAccount } from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Move to WordPress.com' ), () => {
	const credentials = SecretsManager.secrets.testAccounts.defaultUser;

	let page: Page;
	let startImportFlow: StartImportFlow;

	/**
	 * Navigate to site picker page.
	 *
	 * @param siteSlug The site slug URL.
	 */
	const navigateToSitePicker = (
		siteSlug: string,
		queryStrings: { [ key: string ]: string } = {}
	) => {
		test( `Navigate to Site Picker page from ${ siteSlug }`, async () => {
			await startImportFlow.goToSitePickerPage( { from: siteSlug, ...queryStrings } );
		} );
	};

	const initializeUser = async ( username: 'defaultUser' | 'atomicUser' = 'defaultUser' ) => {
		const testAccount = new TestAccount( username );
		await testAccount.authenticate( page );
	};

	beforeAll( async () => {
		page = await browser.newPage();
		startImportFlow = new StartImportFlow( page, 'migration' );

		await initializeUser( 'defaultUser' );
	} );

	describe( 'Show the site selector', () => {
		navigateToSitePicker( 'example.com' );

		test( 'Has the first site to be selected', async () => {
			await startImportFlow.validateSitePickerHasSite(
				credentials.testSites?.primary?.url as string
			);
		} );
	} );

	describe( 'Show an empty site selector with invalid search string', () => {
		navigateToSitePicker( 'example.com', { search: 'notfound' } );

		test( 'Has the first site to be selected', async () => {
			await startImportFlow.validateSitePickerHasNoSites();
		} );
	} );

	describe( 'Select first site', () => {
		navigateToSitePicker( 'example.com' );

		test( 'A modal is shown when the user select the first element', async () => {
			await startImportFlow.selectMigrationSite();
		} );
	} );

	/* describe( 'Select first site and confirm', () => {
		navigateToSitePicker( 'example.com' );

		test( 'The importer error page is selected when using an invalid start site', async () => {
			await startImportFlow.selectMigrationSite( true, false );
		} );
	} ); */

	/* describe( 'Select site and confirm', () => {
		navigateToSitePicker( 'make.wordpress.org' );

		test( 'The importer success page is selected when using a valid start site', async () => {
			await startImportFlow.selectMigrationSite( true, true );
		} );
	} ); */
} );
