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

	beforeAll( async () => {
		page = await browser.newPage();
		startImportFlow = new StartImportFlow( page, 'migration' );

		const testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page );
	} );

	/**
	 * Navigate to site picker page.
	 *
	 * @param siteSlug The site slug URL.
	 */
	const navigateToSitePicker = (
		siteSlug: string,
		queryStrings: { [ key: string ]: string } = {}
	) => {
		it( `Navigate to Site Picker page from ${ siteSlug }`, async () => {
			await startImportFlow.startMigrate( { from: siteSlug, ...queryStrings } );
		} );
	};

	describe( 'Show the site selector', () => {
		navigateToSitePicker( 'example.com' );

		it( 'Has the first site to be selected', async () => {
			await startImportFlow.validateSitePickerHasSite(
				credentials.testSites?.primary?.url as string
			);
		} );
	} );

	describe( 'Show an empty site selector with invalid search string', () => {
		navigateToSitePicker( 'example.com', { search: 'notfound' } );

		it( 'Has the first site to be selected', async () => {
			await startImportFlow.validateSitePickerHasNoSites();
		} );
	} );

	describe( 'Select first element', () => {
		navigateToSitePicker( 'example.com' );

		it( 'A modal is shown when the user select the first element', async () => {
			await startImportFlow.clickButton( 'Select this site' );
			await page.waitForSelector( 'h1:text("Confirm your choice")' );
		} );
	} );

	// p2User
} );
