/**
 * @group jetpack
 */

import {
	DataHelper,
	TestAccount,
	PluginsPage,
	SnackbarNotificationComponent,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Jetpack: Plugin' ), function () {
	const pluginName = 'Hello Dolly';
	let page: Page;
	let pluginsPage: PluginsPage;
	let siteURL: string;

	beforeAll( async function () {
		page = await browser.newPage();

		const testAccount = new TestAccount( 'jetpackUser' );
		await testAccount.authenticate( page );
		// This is bit of a hacky workaround to avoid committing
		// in plain text the URL of our test sites.
		// @TODO We really ought to make a function in DataHelper
		// to somehow extract the user's site.
		await page.waitForLoadState( 'networkidle' );
		siteURL = page.url().split( 'stats/day/' ).slice( -1 )[ 0 ];
	} );

	it( 'Navigate to Plugins', async function () {
		pluginsPage = new PluginsPage( page );
		await pluginsPage.visit( siteURL );
	} );

	describe( 'Plugin: Install', function () {
		beforeAll( async function () {
			// Ensure known good state by removing the plugin
			// if already installed.
			await pluginsPage.visitPage( 'hello-dolly', siteURL );
			if ( await pluginsPage.pluginIsInstalled() ) {
				await pluginsPage.clickRemovePlugin();
			}
			await pluginsPage.visit( siteURL );
		} );

		it( `Search for ${ pluginName }`, async function () {
			await pluginsPage.search( 'Hello Dolly' );
		} );

		it( `Click on result for ${ pluginName }`, async function () {
			await pluginsPage.clickSearchResult( pluginName );
		} );

		it( 'Install plugin', async function () {
			await pluginsPage.clickInstallPlugin();
		} );
	} );

	describe( 'Plugin: Remove', function () {
		it( `Visit ${ pluginName } page`, async function () {
			await page.goBack();
		} );

		it( 'Remove plugin', async function () {
			await pluginsPage.clickRemovePlugin();
			const snackbarNotificationComponent = new SnackbarNotificationComponent( page );
			await snackbarNotificationComponent.noticeShown(
				`Successfully removed ${ pluginName } on ${ siteURL }.`,
				{ type: 'Success' }
			);
		} );
	} );
} );
