/**
 * @group calypso-pr
 */

import { DataHelper, TestAccount, PluginsPage, envVariables } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Plugins page /plugins' ), function () {
	let page: Page;
	let pluginsPage: PluginsPage;

	beforeAll( async () => {
		page = await browser.newPage();
		const testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page );
	} );

	it( 'Visit plugins page', async function () {
		pluginsPage = new PluginsPage( page );
		await pluginsPage.visit();
	} );

	it.each( [ 'Premium', 'Featured', 'Popular', 'New' ] )(
		'Plugins page loads %s section',
		async function ( section: string ) {
			await pluginsPage.validateHasSection( section );
		}
	);

	it( 'Can browse all popular plugins', async function () {
		await pluginsPage.clickBrowseAllPopular();
		await pluginsPage.validateHasSection( 'All Popular Plugins' );
	} );

	it( 'Can return via breadcrumb', async function () {
		if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
			await pluginsPage.clickPluginsBreadcrumb();
		} else {
			await pluginsPage.clickBackBreadcrumb();
		}
		await pluginsPage.validateHasSection( 'Premium' );
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
} );

describe( DataHelper.createSuiteTitle( 'Plugins page /plugins/:wpcom-site' ), function () {
	let page: Page;
	let pluginsPage: PluginsPage;
	let siteUrl: string;

	beforeAll( async () => {
		page = await browser.newPage();
		const testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page );
		siteUrl = testAccount.getSiteURL( { protocol: false } );
	} );

	it( 'Visit plugins page', async function () {
		pluginsPage = new PluginsPage( page );
		await pluginsPage.visit( siteUrl );
	} );

	it.each( [ 'Premium', 'Featured', 'Popular', 'New' ] )(
		'Plugins page loads %s section',
		async function ( section: string ) {
			await pluginsPage.validateHasSection( section );
		}
	);
} );

describe( DataHelper.createSuiteTitle( 'Plugins page /plugins/:jetpack-site' ), function () {
	let page: Page;
	let pluginsPage: PluginsPage;
	let siteUrl: string;

	beforeAll( async () => {
		page = await browser.newPage();
		const testAccount = new TestAccount( 'jetpackUserPREMIUM' );
		await testAccount.authenticate( page );
		siteUrl = testAccount
			.getSiteURL( { protocol: false } )
			.replace( 'https://', '' )
			.replace( '/wp-admin', '' );
	} );

	it( 'Visit plugins page', async function () {
		pluginsPage = new PluginsPage( page );
		await pluginsPage.visit( siteUrl );
	} );

	it.each( [ 'Featured', 'Popular', 'New' ] )(
		'Plugins page loads %s section',
		async function ( section: string ) {
			await pluginsPage.validateHasSection( section );
		}
	);

	// We don't support marketplace plugin purchases on self hosted sites. (Source code download restrictions)
	it( 'Plugins page does not load premium plugins on Jetpack sites', async function () {
		await pluginsPage.validateNotHasSection( 'Premium' );
	} );
} );
