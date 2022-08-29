/**
 * @group calypso-pr
 */

import {
	DataHelper,
	TestAccount,
	PluginsPage,
	envVariables,
	SecretsManager,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Plugins: Browse' ), function () {
	const credentials = SecretsManager.secrets.testAccounts.multiSiteUser;
	let page: Page;
	let pluginsPage: PluginsPage;

	beforeAll( async () => {
		page = await browser.newPage();
		const testAccount = new TestAccount( 'multiSiteUser' );
		await testAccount.authenticate( page );
	} );

	describe( 'Plugins page /plugins', function () {
		it( 'Visit plugins page', async function () {
			pluginsPage = new PluginsPage( page );
			await pluginsPage.visit();
		} );

		it.each( [ 'Top premium plugins', 'Editor’s pick', 'Top free plugins' ] )(
			'Plugins page loads %s section',
			async function ( section: string ) {
				await pluginsPage.validateHasSection( section );
			}
		);

		it( 'Can browse all free plugins', async function () {
			await pluginsPage.clickBrowseAllFreePlugins();
			await pluginsPage.validateHasHeaderTitle( 'Top free plugins' );
		} );

		it( 'Can return via breadcrumb', async function () {
			if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
				await pluginsPage.clickPluginsBreadcrumb();
			} else {
				await pluginsPage.clickBackBreadcrumb();
			}
			await pluginsPage.validateHasSection( 'Top premium plugins' );
		} );
		it( 'Can browse all premium plugins', async function () {
			await pluginsPage.clickBrowseAllPaidPlugins();
			await pluginsPage.validateHasHeaderTitle( 'Top premium plugins' );
		} );

		it( 'Can return via breadcrumb from premium plugins', async function () {
			if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
				await pluginsPage.clickPluginsBreadcrumb();
			} else {
				await pluginsPage.clickBackBreadcrumb();
			}
			await pluginsPage.validateHasSection( 'Top premium plugins' );
		} );

		it.each( [
			'WooCommerce',
			'Yoast SEO',
			'MailPoet – emails and newsletters in WordPress',
			'Jetpack CRM – Clients, Invoices, Leads, & Billing for WordPress',
			'Contact Form 7',
			'Site Kit by Google – Analytics, Search Console, AdSense, Speed',
		] )( 'Featured Plugins section should show the %s plugin', async function ( plugin: string ) {
			await pluginsPage.validateHasPluginOnSection( 'featured', plugin );
		} );

		it( 'Can browse SEO category', async function () {
			await pluginsPage.validateCategoryButton(
				'Search Engine Optimization',
				envVariables.VIEWPORT_NAME !== 'mobile' ? true : false
			);
		} );

		it.each( [ 'Yoast SEO' ] )(
			'SEO category should show the %s plugin',
			async function ( plugin: string ) {
				await pluginsPage.validateHasPluginInCategory( 'Search Engine Optimization', plugin );
			}
		);
	} );

	describe( 'Plugins page /plugins/:wpcom-site', function () {
		it( 'Visit plugins page', async function () {
			pluginsPage = new PluginsPage( page );
			await pluginsPage.visit( credentials.primarySite );
		} );

		it.each( [ 'Top premium plugins', 'Editor’s pick', 'Top free plugins' ] )(
			'Plugins page loads %s section',
			async function ( section: string ) {
				await pluginsPage.validateHasSection( section );
			}
		);

		it( 'Breadcrum update site when switch site', async function () {
			if ( credentials.otherSites?.length ) {
				await pluginsPage.clickBrowseAllPaidPlugins();
				await pluginsPage.switchToSite(
					credentials.otherSites[ 0 ],
					envVariables.VIEWPORT_NAME !== 'mobile' ? true : false
				);
				if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
					// Ensure the page is wide enough to show the breadcrumb details.
					await page.setViewportSize( { width: 1300, height: 1080 } );
					await pluginsPage.clickPluginsBreadcrumb();
				} else {
					await pluginsPage.clickBackBreadcrumb();
				}
				await pluginsPage.checkSiteOnUrl( credentials.otherSites[ 0 ] );
			}
		} );
	} );
} );
