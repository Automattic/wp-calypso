/**
 * @group calypso-pr
 */

import {
	DataHelper,
	TestAccount,
	PluginsPage,
	SecretsManager,
	envVariables,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Plugins search' ), function () {
	const credentials = SecretsManager.secrets.testAccounts.multiSiteUser;
	let page: Page;
	let pluginsPage: PluginsPage;

	beforeAll( async () => {
		page = await browser.newPage();
		const testAccount = new TestAccount( 'multiSiteUser' );
		await testAccount.authenticate( page );
	} );

	it( 'Visit plugins page', async function () {
		pluginsPage = new PluginsPage( page );
		await pluginsPage.visit();
	} );

	it( 'Search for ecommerce', async function () {
		await pluginsPage.search( 'ecommerce' );
		await pluginsPage.validateExpectedSearchResultFound( 'WooCommerce' );
	} );

	it( 'The site param in plugin detail breadcrumb url updates when the user switches between sites', async function () {
		if ( credentials.otherSites?.length ) {
			pluginsPage = new PluginsPage( page );
			await pluginsPage.visit( credentials.primarySite );
			await pluginsPage.clickSearchResult( 'Yoast SEO Premium' );
			await pluginsPage.switchToSite(
				credentials.otherSites[ 0 ],
				envVariables.VIEWPORT_NAME !== 'mobile' ? true : false
			);
			if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
				// Ensure the page is wide enough to show the breadcrumb details.
				await page.setViewportSize( { width: 1300, height: 1080 } );
				await pluginsPage.clickPluginsDetailBreadcrumb();
			} else {
				await pluginsPage.clickBackBreadcrumb();
			}
			await pluginsPage.checkSiteOnUrl( credentials.otherSites[ 0 ] );
		}
	} );
} );
