/**
 * @group calypso-pr
 */

import { DataHelper, TestAccount, PluginsPage } from '@automattic/calypso-e2e';
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
			await pluginsPage.hasSection( section );
		}
	);
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
			await pluginsPage.hasSection( section );
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
			await pluginsPage.hasSection( section );
		}
	);

	// We don't support marketplace plugin purchases on self hosted sites. (Source code download restrictions)
	it( 'Plugins page does not load premium plugins on Jetpack sites', async function () {
		await pluginsPage.notHasSection( 'Premium' );
	} );
} );
