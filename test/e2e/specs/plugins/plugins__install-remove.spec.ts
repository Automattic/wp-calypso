import {
	DataHelper,
	NoticeComponent,
	PluginsPage,
	RestAPIClient,
	SecretsManager,
	TestAccount,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';
import type { Page } from 'playwright';

// .fixme: not run by any recurring CI job (@jetpack-remote-site is not grepped by any build)
// and currently failing: the post-install Calypso confirmation never renders for a free-plugin
// install on a jetpack-remote-site. See TESTOPS-145.
test.describe.fixme(
	DataHelper.createSuiteTitle( 'Jetpack: Plugin' ),
	{ tag: [ tags.JETPACK_REMOTE_SITE ] },
	() => {
		test.describe.configure( { mode: 'serial' } );

		let pluginName: string;
		let page: Page;
		let pluginsPage: PluginsPage;
		let siteURL: string;
		let previousViewportName: string | undefined;

		test.beforeAll( async ( { browser } ) => {
			// beforeAll cannot request the per-test `page` fixture, so the project's viewport
			// and device options are not applied automatically. Derive them from the project
			// config so each matrix leg (chrome/desktop, pixel/mobile) targets a distinct plugin
			// and runs against the matching device context.
			const { viewportName = 'desktop', ...contextOptions } = test.info().project.use as {
				viewportName?: string;
			};
			previousViewportName = process.env.VIEWPORT_NAME;
			process.env.VIEWPORT_NAME = viewportName;
			pluginName = viewportName === 'desktop' ? 'Hello Dolly' : 'Developer';

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

			const context = await browser.newContext( contextOptions );
			page = await context.newPage();
			const testAccount = new TestAccount( 'jetpackRemoteSiteUser' );
			await testAccount.authenticate( page );
			siteURL = SecretsManager.secrets.testAccounts.jetpackRemoteSiteUser.testSites?.primary
				.url as string;
			pluginsPage = new PluginsPage( page );
			await pluginsPage.visit( siteURL );
		} );

		test.afterAll( async () => {
			await page?.context().close();
			if ( previousViewportName === undefined ) {
				delete process.env.VIEWPORT_NAME;
			} else {
				process.env.VIEWPORT_NAME = previousViewportName;
			}
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
