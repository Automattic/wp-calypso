/**
 * @group jetpack
 */

import {
	DataHelper,
	envVariables,
	TestAccount,
	PluginsPage,
	NoticeComponent,
	RestAPIClient,
	SecretsManager,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { skipDescribeIf } from '../../jest-helpers';

declare const browser: Browser;

// These tests involve installing a plugin, which only makes sense for testing remote jetpack sites.
skipDescribeIf( envVariables.JETPACK_TARGET !== 'remote-site' )(
	DataHelper.createSuiteTitle( 'Jetpack: Plugin' ),
	function () {
		// Use a different plugin name to avoid clash between mobile and desktop
		// build configurations.
		const pluginName = envVariables.VIEWPORT_NAME === 'desktop' ? 'Hello Dolly' : 'Developer';
		let page: Page;
		let pluginsPage: PluginsPage;
		let noticeComponent: NoticeComponent;
		let siteURL: string;
		let restAPIClient: RestAPIClient;

		beforeAll( async function () {
			// Ensure known good state by removing the plugin if already installed.
			restAPIClient = new RestAPIClient(
				SecretsManager.secrets.testAccounts.jetpackRemoteSiteUser
			);
			const siteID = SecretsManager.secrets.testAccounts.jetpackRemoteSiteUser.testSites?.primary
				.id as number;
			const response = await restAPIClient.removePluginIfInstalled( siteID, pluginName );

			if ( response ) {
				console.log( `Successfully removed the plugin '${ pluginName }'.` );
			} else {
				console.log( `Unable to remove the plugin '${ pluginName }'; no action performed.` );
			}

			page = await browser.newPage();

			const testAccount = new TestAccount( 'jetpackRemoteSiteUser' );
			await testAccount.authenticate( page );
			await page.waitForLoadState( 'networkidle' );
			siteURL = SecretsManager.secrets.testAccounts.jetpackRemoteSiteUser.testSites?.primary
				.url as string;
			pluginsPage = new PluginsPage( page );
			await pluginsPage.visit( siteURL );
		} );

		describe( 'Plugin: Install', function () {
			it( 'Install plugin', async function () {
				await pluginsPage.visitPage( pluginName.replace( ' ', '-' ).toLowerCase(), siteURL );
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
				await pluginsPage.setPluginAttribute( 'off' );
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
	}
);
