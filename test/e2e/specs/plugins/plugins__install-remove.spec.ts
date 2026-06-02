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

// .fixme: after clicking Install on the Jetpack remote site, the flow no longer
// lands on the Calypso "Congrats on your site's new superpowers!" confirmation
// page. Instead it redirects to the remote site's wp-login.php (Jetpack SSO)
// with redirect_to=wp-admin/plugins.php?activate=true, so
// validateConfirmationPagePostInstall times out on that heading. The install is
// being completed/activated through the remote site's wp-admin rather than the
// Calypso-managed confirmation surface. Re-enabling needs the current
// Jetpack-remote-site plugin install/activate flow re-mapped (and confirmation
// the SSO wall is expected); this is more than a selector refresh. See TESTOPS-49.
test.describe(
	DataHelper.createSuiteTitle( 'Jetpack: Plugin' ),
	{ tag: [ tags.JETPACK_REMOTE_SITE ] },
	() => {
		// Use a different plugin name to avoid clash between mobile and desktop build configurations.
		const pluginName = envVariables.VIEWPORT_NAME === 'desktop' ? 'Hello Dolly' : 'Developer';

		test( 'As a Jetpack user, I can install, deactivate, and remove a plugin', async ( {
			page,
		} ) => {
			let pluginsPage: PluginsPage;
			let siteURL: string;

			await test.step( 'Setup: ensure plugin is not already installed', async () => {
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
			} );

			await test.step( 'Authenticate and visit plugins page', async () => {
				const testAccount = new TestAccount( 'jetpackRemoteSiteUser' );
				await testAccount.authenticate( page );
				siteURL = SecretsManager.secrets.testAccounts.jetpackRemoteSiteUser.testSites?.primary
					.url as string;
				pluginsPage = new PluginsPage( page );
				await pluginsPage.visit( siteURL );
			} );

			await test.step( 'Install plugin', async () => {
				await pluginsPage.visitPage( pluginName.replace( ' ', '-' ).toLowerCase(), siteURL );
				await pluginsPage.clickInstallPlugin();
			} );

			await test.step( 'See confirmation page', async () => {
				await pluginsPage.validateConfirmationPagePostInstall( pluginName );
			} );

			await test.step( 'Click manage plugin', async () => {
				await pluginsPage.clickManageInstalledPluginButton();
			} );

			await test.step( 'Deactivate plugin', async () => {
				await pluginsPage.clickDeactivatePlugin();
			} );

			await test.step( 'Remove plugin', async () => {
				await pluginsPage.clickRemovePlugin();
				const noticeComponent = new NoticeComponent( page );
				const message = `Successfully removed ${ pluginName }`;
				await noticeComponent.noticeShown( message, { type: 'Success' } );
				await noticeComponent.dismiss( message );
			} );
		} );
	}
);
