/**
 * @group calypso-pr
 */

import {
	DataHelper,
	TestAccount,
	PluginsPage,
	envVariables,
	SidebarComponent,
} from '@automattic/calypso-e2e';
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

	it( 'Navigate to the plugins page', async function () {
		const sidebarCompoonent = new SidebarComponent( page );
		await sidebarCompoonent.navigate( 'Plugins' );
	} );

	it( 'Search for "jetpack"', async function () {
		pluginsPage = new PluginsPage( page );
		await pluginsPage.search( 'jetpack' );
		await pluginsPage.validateExpectedSearchResultFound( 'Jetpack Protect' );
	} );

	it( 'Click on a search result', async function () {
		await pluginsPage.clickSearchResult( 'Jetpack Protect' );
		await pluginsPage.validatePluginDetailsHasHeaderTitle( 'Jetpack Protect' );
	} );

	it( 'Click on breadcrumbs "Search Results"', async function () {
		if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
			await pluginsPage.clickSearchResultsBreadcrumb();
		} else {
			await pluginsPage.clickBackBreadcrumb();
		}
		await pluginsPage.validateExpectedSearchResultFound( 'Jetpack Protect' );
	} );

	it( 'Click on breadcrumbs "Plugins"', async function () {
		await pluginsPage.clickSearchResult( 'Jetpack Protect' );
		if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
			await pluginsPage.clickPluginsBreadcrumb();
			await pluginsPage.validateHasSection( PluginsPage.paidSection );
		} else {
			await pluginsPage.clickBackBreadcrumb();
			await pluginsPage.validateExpectedSearchResultFound( 'Jetpack Protect' );
		}
	} );
} );
