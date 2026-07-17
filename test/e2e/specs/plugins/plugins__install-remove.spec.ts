import {
	DataHelper,
	NoticeComponent,
	PluginsPage,
	RestAPIClient,
	SecretsManager,
	TestAccount,
	envVariables,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';
import type { Page } from 'playwright';

// Remote installs currently redirect to Jetpack SSO instead of the Calypso confirmation flow.
test.describe.fixme(
	DataHelper.createSuiteTitle( 'Jetpack: Plugin' ),
	{ tag: [ tags.JETPACK_REMOTE_SITE ] },
	() => {
		test.describe.configure( { mode: 'serial' } );

		const pluginName = envVariables.VIEWPORT_NAME === 'desktop' ? 'Hello Dolly' : 'Developer';
		let page: Page;
		let pluginsPage: PluginsPage;
		let siteURL: string;

		test.beforeAll( async ( { browser } ) => {
			const restAPIClient = new RestAPIClient(
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
			siteURL = SecretsManager.secrets.testAccounts.jetpackRemoteSiteUser.testSites?.primary
				.url as string;
			pluginsPage = new PluginsPage( page );
			await pluginsPage.visit( siteURL );
		} );

		test( 'Install plugin', async () => {
			await pluginsPage.visitPage( pluginName.replace( ' ', '-' ).toLowerCase(), siteURL );
			await pluginsPage.clickInstallPlugin();
		} );

		test( 'See confirmation page', async () => {
			await pluginsPage.validateConfirmationPagePostInstall( pluginName );
		} );

		test( 'Click manage plugin', async () => {
			await pluginsPage.clickManageInstalledPluginButton();
		} );

		test( 'Deactivate plugin', async () => {
			await pluginsPage.clickDeactivatePlugin();
		} );

		test( 'Remove plugin', async () => {
			await pluginsPage.clickRemovePlugin();
			const noticeComponent = new NoticeComponent( page );
			const message = `Successfully removed ${ pluginName }`;
			await noticeComponent.noticeShown( message, { type: 'Success' } );
			await noticeComponent.dismiss( message );
		} );
	}
);
