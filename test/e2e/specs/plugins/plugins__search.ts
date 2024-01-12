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
	let siteUrl: string;

	beforeAll( async () => {
		page = await browser.newPage();
		const testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page );

		siteUrl = testAccount
			.getSiteURL( { protocol: false } )
			.replace( 'https://', '' )
			.replace( '/wp-admin', '' );

		if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
			// Ensure the page is wide enough to show the breadcrumb details.
			await page.setViewportSize( { width: 1300, height: 1080 } );
		}
	} );

	it( 'Navigate to the plugins page', async function () {
		const sidebarCompoonent = new SidebarComponent( page );
		await sidebarCompoonent.navigate( 'Plugins' );
	} );

	it( 'Search for "woocommerce"', async function () {
		pluginsPage = new PluginsPage( page );
		await pluginsPage.search( 'woocommerce' );
		// for this assumption we need to use a plugin whose name isn't changed often
		await pluginsPage.validateExpectedSearchResultFound( 'WooCommerce' );
	} );

	it( 'Click on a search result', async function () {
		await pluginsPage.clickSearchResult( 'WooCommerce' );
		await pluginsPage.validatePluginDetailsHasHeaderTitle( 'WooCommerce' );
	} );

	it( 'Click on breadcrumbs "Search Results"', async function () {
		if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
			await pluginsPage.clickSearchResultsBreadcrumb();
		} else {
			await pluginsPage.clickBackBreadcrumb();
		}
		await pluginsPage.validateExpectedSearchResultFound( 'WooCommerce' );
	} );

	it( 'Click on breadcrumbs "Plugins"', async function () {
		await pluginsPage.clickSearchResult( 'WooCommerce' );
		if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
			await pluginsPage.clickPluginsBreadcrumb();
			await pluginsPage.validateHasSection( PluginsPage.paidSection );
		} else {
			await pluginsPage.clickBackBreadcrumb();
			await pluginsPage.validateExpectedSearchResultFound( 'WooCommerce' );
		}
	} );

	it( 'Navigate back to the default plugins page when searching from categories pages', async function () {
		await pluginsPage.validateCategoryButton(
			'Search Engine Optimization',
			envVariables.VIEWPORT_NAME !== 'mobile'
		);
		await pluginsPage.search( 'woocommerce' );

		// Check if its redirecting to the default plugins page
		await page.waitForURL( new RegExp( `/plugins/${ siteUrl }\\?s=woocommerce`, 'g' ) );
	} );
} );
