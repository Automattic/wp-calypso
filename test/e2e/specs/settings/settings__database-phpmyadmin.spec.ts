/**
 * Checks the phpMyAdmin page opens with the proper bearer token.
 *
 * See: https://github.com/Automattic/wp-calypso/issues/82850.
 *
 * Keywords: Settings, Jetpack, Hosting Configuration, phpMyAdmin
 */

import {
	DataHelper,
	SiteSettingsPage,
	TestAccount,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';
import { expect, tags, test } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'Settings: Access phpMyAdmin' ),
	{ tag: [ tags.JETPACK_WPCOM_INTEGRATION, tags.CALYPSO_PR ] },
	() => {
		const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );

		test( 'As a user, I can open phpMyAdmin from site settings', async ( { page } ) => {
			test.skip( ! envVariables.TEST_ON_ATOMIC, 'Only runs on Atomic sites' );

			let popupPage: Page;
			let siteSettingsPage: SiteSettingsPage;

			await test.step( 'Authenticate', async () => {
				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
				siteSettingsPage = new SiteSettingsPage( page );

				await siteSettingsPage.visit(
					new TestAccount( accountName ).getSiteURL( { protocol: false } ),
					'database'
				);
			} );

			await test.step( 'Open phpMyAdmin', async () => {
				const waitForPopup = page.waitForEvent( 'popup' );
				await siteSettingsPage.clickButton( 'Open phpMyAdmin' );
				popupPage = await waitForPopup;
			} );

			await test.step( 'phpMyAdmin page URL contains token', async () => {
				const url = popupPage.url();
				expect( url ).toMatch( /token=([A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$)/ );
			} );

			await test.step( 'Land in phpMyAdmin', async () => {
				await popupPage.waitForURL( /_pma/ );
				await popupPage.getByRole( 'link', { name: 'phpMyAdmin', exact: true } ).waitFor();
			} );
		} );
	}
);
