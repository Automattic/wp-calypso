/**
 * @group calypso-pr
 */

import { DataHelper, TestAccount, PluginsPage } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'WooCommerce Landing Page' ), function () {
	let page: Page;
	let pluginsPage: PluginsPage;
	let siteUrl: string;

	beforeEach( async () => {
		page = await browser.newPage();
	} );

	afterEach( async () => {
		await page.close();
	} );

	it( 'Plugins page loads premium,featured,popular,new sections', async function () {
		const testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page );
		siteUrl = testAccount.getSiteURL( { protocol: false } );

		pluginsPage = new PluginsPage( page );
		await pluginsPage.visit( siteUrl );
		await pluginsPage.onlyHasSections( [ 'Premium', 'Featured', 'Popular', 'New' ] );
	} );

	it( 'Plugins page loads featured,popular,new sections on Jetpack sites', async function () {
		const testAccount = new TestAccount( 'jetpackUserPREMIUM' );
		await testAccount.authenticate( page );
		siteUrl = testAccount
			.getSiteURL( { protocol: false } )
			.replace( 'https://', '' )
			.replace( '/wp-admin', '' );

		pluginsPage = new PluginsPage( page );
		await pluginsPage.visit( siteUrl );
		await pluginsPage.onlyHasSections( [ 'Featured', 'Popular', 'New' ] );
	} );
} );
