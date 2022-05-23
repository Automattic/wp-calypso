/**
 * @group calypso-pr
 * @group jetpack
 */

import { DataHelper, TestAccount, PluginsPage } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

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

	it.each( [ 'Editor’s pick', 'Top free plugins' ] )(
		'Plugins page loads %s section',
		async function ( section: string ) {
			await pluginsPage.validateHasSubtitle( section );
		}
	);

	// We don't support marketplace plugin purchases on self hosted sites. (Source code download restrictions)
	it( 'Plugins page does not load premium plugins on Jetpack sites', async function () {
		await pluginsPage.validateNotHasSection( 'Top paid plugins' );
	} );
} );
