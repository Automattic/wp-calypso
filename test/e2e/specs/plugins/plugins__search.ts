/**
 * @group calypso-pr
 */

import { DataHelper, TestAccount, PluginsPage, envVariables } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Plugins search' ), function () {
	let page: Page;
	let pluginsPage: PluginsPage;

	beforeAll( async () => {
		page = await browser.newPage();
		const testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page );

		if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
			// Ensure the page is wide enough to show the breadcrumb details.
			await page.setViewportSize( { width: 1300, height: 1080 } );
		}
	} );

	it( 'Visit plugins page', async function () {
		pluginsPage = new PluginsPage( page );
		await pluginsPage.visit();
	} );

	it( 'Search for "shipping"', async function () {
		await pluginsPage.search( 'shipping' );
		await pluginsPage.validateExpectedSearchResultFound( 'Royal Mail' );
	} );

	it( 'Click on a search result', async function () {
		await pluginsPage.clickSearchResult( 'Royal Mail' );
		await pluginsPage.validatePluginDetailsHasHeaderTitle( 'Royal Mail' );
	} );

	it( 'Click on breadcrumbs "Search Results"', async function () {
		if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
			await pluginsPage.clickSearchResultsBreadcrumb();
		} else {
			await pluginsPage.clickBackBreadcrumb();
		}
		await pluginsPage.validateExpectedSearchResultFound( 'Royal Mail' );
	} );

	it( 'Click on breadcrumbs "Plugins"', async function () {
		await pluginsPage.clickSearchResult( 'Royal Mail' );
		if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
			await pluginsPage.clickPluginsBreadcrumb();
			await pluginsPage.validateHasSection( 'Must-have premium plugins' );
		} else {
			await pluginsPage.clickBackBreadcrumb();
			await pluginsPage.validateExpectedSearchResultFound( 'Royal Mail' );
		}
	} );
} );
