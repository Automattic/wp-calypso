/**
 * @group jetpack
 */

import {
	DataHelper,
	envVariables,
	TestAccount,
	PluginsPage,
	NoticeComponent,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Jetpack: Plugin' ), function () {
	// Use a different plugin name to avoid clash between mobile and desktop
	// build configurations.
	const pluginName = envVariables.VIEWPORT_NAME === 'desktop' ? 'Hello Dolly' : 'Developer';
	let page: Page;
	let pluginsPage: PluginsPage;
	let noticeComponent: NoticeComponent;
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

		pluginsPage = new PluginsPage( page );
		await pluginsPage.visit( siteURL );
		// Ensure known good state by removing the plugin
		// if already installed.
		await pluginsPage.visitPage( pluginName.replace( ' ', '-' ).toLowerCase(), siteURL );
		if ( await pluginsPage.pluginIsInstalled() ) {
			await pluginsPage.clickRemovePlugin();
		}
	} );

	describe( 'Plugin: Install', function () {
		it( 'Install plugin', async function () {
			await pluginsPage.clickInstallPlugin();
		} );

		it( `Return to ${ pluginName } page`, async function () {
			await page.goBack();
			noticeComponent = new NoticeComponent( page );
			const message = `Successfully installed and activated ${ pluginName } on ${ siteURL }`;
			await noticeComponent.noticeShown( message, { type: 'Success' } );
			await noticeComponent.dismiss( message );
		} );
	} );

	describe( 'Plugin: Deactivate', function () {
		it( 'Deactivate plugin', async function () {
			await pluginsPage.togglePluginAttribute( 'Active', 'off' );
		} );
	} );

	describe( 'Plugin: Remove', function () {
		it( 'Remove plugin', async function () {
			await pluginsPage.clickRemovePlugin();
			const message = `Successfully removed ${ pluginName } on ${ siteURL }.`;
			await noticeComponent.noticeShown( message, {
				type: 'Success',
			} );
			await noticeComponent.dismiss( message );
		} );
	} );
} );
