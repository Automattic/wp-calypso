/**
 * @group calypso-pr
 * @group jetpack-remote-site
 */

import {
	DataHelper,
	TestAccount,
	PluginsPage,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Plugins: Browse' ), function () {
	let page: Page;
	let pluginsPage: PluginsPage;
	let siteUrl: string;

	beforeAll( async () => {
		page = await browser.newPage();
		const testUser = getTestAccountByFeature( envToFeatureKey( envVariables ), [
			{
				gutenberg: 'stable',
				siteType: 'simple',
				accountName: 'defaultUser',
			},
		] );
		const testAccount = new TestAccount( testUser );
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

	const expectedSections = [ PluginsPage.featuredSection, PluginsPage.freeSection ];
	if ( envVariables.JETPACK_TARGET !== 'remote-site' ) {
		// On WPCOM sites, we should premium plugins.
		// These are hidden on self hosted sites due to source code download restrictions.
		expectedSections.push( PluginsPage.paidSection );
	}

	it.each( expectedSections )( 'Plugins page loads %s section', async function ( section: string ) {
		await pluginsPage.validateHasSection( section );
	} );

	it( 'Can browse all free plugins', async function () {
		await pluginsPage.clickBrowseAllFreePlugins();
		await pluginsPage.validateHasHeaderTitle( PluginsPage.freeSection );
	} );

	it( 'Can return via category', async function () {
		if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
			await pluginsPage.clickCategory( 'Discover' );
		} else {
			await pluginsPage.clickDropdownCategory( 'Discover' );
		}
		await pluginsPage.validateHasSection( PluginsPage.freeSection );
	} );

	// See above -- premium marketplace plugins are not supported on self hosted sites.
	if ( envVariables.JETPACK_TARGET !== 'remote-site' ) {
		it( 'Can browse all premium plugins', async function () {
			await pluginsPage.clickBrowseAllPaidPlugins();
			await pluginsPage.validateHasHeaderTitle( PluginsPage.paidSection );
		} );

		it( 'Can return via breadcrumb from premium plugins', async function () {
			if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
				await pluginsPage.clickCategory( 'Discover' );
			} else {
				await pluginsPage.clickDropdownCategory( 'Discover' );
			}
			await pluginsPage.validateHasSection( PluginsPage.paidSection );
		} );
	} else {
		it( 'Plugins page does not load premium plugins on Jetpack sites', async function () {
			await pluginsPage.validateNotHasSection( PluginsPage.paidSection );
		} );
	}

	it.each( [
		'WooCommerce',
		'MailPoet – emails and newsletters in WordPress',
		'Jetpack CRM – Clients, Invoices, Leads, & Billing for WordPress',
	] )( 'Featured Plugins section should show the %s plugin', async function ( plugin: string ) {
		await pluginsPage.validateHasPluginOnSection( PluginsPage.featuredSection, plugin );
	} );

	it( 'Can browse SEO category', async function () {
		await pluginsPage.validateCategoryButton(
			'Search Engine Optimization',
			envVariables.VIEWPORT_NAME !== 'mobile' ? true : false
		);
		await page.waitForURL( new RegExp( `/plugins/browse/seo/${ siteUrl }$` ) );
	} );

	it.each( [ 'Yoast SEO' ] )(
		'SEO category should show the %s plugin',
		async function ( plugin: string ) {
			await pluginsPage.validateHasPluginInCategory( 'Search Engine Optimization', plugin );
		}
	);
} );
