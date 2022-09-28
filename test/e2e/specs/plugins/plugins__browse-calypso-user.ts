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
	const credentials = SecretsManager.secrets.testAccounts.defaultUser;
	let page: Page;
	let pluginsPage: PluginsPage;

	beforeAll( async () => {
		page = await browser.newPage();
		const testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page );
	} );

	describe( 'Plugins page /plugins', function () {
		it( 'Visit plugins page', async function () {
			pluginsPage = new PluginsPage( page );
			await pluginsPage.visit();
		} );

		it.each( [ PluginsPage.paidSection, PluginsPage.featuredSection, PluginsPage.freeSection ] )(
			'Plugins page loads %s section',
			async function ( section: string ) {
				await pluginsPage.validateHasSection( section );
			}
		);

		it( 'Can browse all free plugins', async function () {
			await pluginsPage.clickBrowseAllFreePlugins();
			await pluginsPage.validateHasHeaderTitle( PluginsPage.freeSection );
		} );

		it( 'Can return via breadcrumb', async function () {
			if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
				await pluginsPage.clickPluginsBreadcrumb();
			} else {
				await pluginsPage.clickBackBreadcrumb();
			}
			await pluginsPage.validateHasSection( PluginsPage.paidSection );
		} );
		it( 'Can browse all premium plugins', async function () {
			await pluginsPage.clickBrowseAllPaidPlugins();
			await pluginsPage.validateHasHeaderTitle( PluginsPage.paidSection );
		} );

		it( 'Can return via breadcrumb from premium plugins', async function () {
			if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
				await pluginsPage.clickPluginsBreadcrumb();
			} else {
				await pluginsPage.clickBackBreadcrumb();
			}
			await pluginsPage.validateHasSection( PluginsPage.paidSection );
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
			await pluginsPage.visit( credentials.testSites?.primary.url as string );
		} );

		it.each( [ PluginsPage.paidSection, PluginsPage.featuredSection, PluginsPage.freeSection ] )(
			'Plugins page loads %s section',
			async function ( section: string ) {
				await pluginsPage.validateHasSection( section );
			}
		);
	} );
} );
