/**
 * @group jetpack-wpcom-integration
 */

import {
	DataHelper,
	TestAccount,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
	HostingConfigurationPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { skipDescribeIf } from '../../jest-helpers';

declare const browser: Browser;

/**
 * Checks the phpMyAdmin page opens with the proper bearer token.
 *
 * See: https://github.com/Automattic/wp-calypso/issues/82850.
 *
 * Keywords: Settings, Jetpack, Hosting Configuration, phpMyAdmin
 */
skipDescribeIf( ! envVariables.TEST_ON_ATOMIC )(
	DataHelper.createSuiteTitle( 'Settings: Access phpMyAdmin' ),
	function () {
		const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );

		let page: Page;
		let popupPage: Page;
		let testAccount: TestAccount;
		let hostingConfigurationPage: HostingConfigurationPage;

		beforeAll( async function () {
			page = await browser.newPage();

			testAccount = new TestAccount( accountName );

			await testAccount.authenticate( page );
		} );

		it( 'Navigate to Settings > Hosting Configuration', async function () {
			hostingConfigurationPage = new HostingConfigurationPage( page );

			await hostingConfigurationPage.visit( testAccount.getSiteURL( { protocol: false } ) );
		} );

		it( 'Open phpMyAdmin', async function () {
			const waitForPopup = page.waitForEvent( 'popup' );
			await hostingConfigurationPage.clickButton( 'Open phpMyAdmin' );

			popupPage = await waitForPopup;
		} );

		it( 'phpMyAdmin page URL contains token', async function () {
			const url = popupPage.url();
			expect( url ).toMatch( /token=([A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$)/ );
		} );

		it( 'Land in phpMyAdmin', async function () {
			await popupPage.waitForURL( /_pma/ );
			await popupPage.getByRole( 'link', { name: 'phpMyAdmin', exact: true } ).waitFor();
		} );
	}
);
