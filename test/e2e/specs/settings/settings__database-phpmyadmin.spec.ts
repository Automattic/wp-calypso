import { SiteSettingsPage, envVariables } from '@automattic/calypso-e2e';
import { Page } from '@playwright/test';
import { expect, tags, test } from '../../lib/pw-base';

/**
 * Checks the phpMyAdmin page opens with the proper bearer token.
 *
 * See: https://github.com/Automattic/wp-calypso/issues/82850.
 *
 * Keywords: Settings, Jetpack, Hosting Configuration, phpMyAdmin
 */
test.describe(
	'Settings: Access phpMyAdmin',
	{ tag: [ tags.JETPACK_WPCOM_INTEGRATION, tags.CALYPSO_PR ] },
	() => {
		let siteSettingsPage: SiteSettingsPage;
		let popupPage: Page;

		test( 'Open phpMyAdmin from Hosting Configuration settings', async ( {
			accountGivenByEnvironment,
			page,
		} ) => {
			test.skip( ! envVariables.TEST_ON_ATOMIC, 'This test only runs on Atomic sites' );

			await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async function () {
				await accountGivenByEnvironment.authenticate( page );
			} );

			await test.step( 'When I navigate to Settings > Hosting Configuration > Database', async function () {
				siteSettingsPage = new SiteSettingsPage( page );
				await siteSettingsPage.visit(
					accountGivenByEnvironment.getSiteURL( { protocol: false } ),
					'database'
				);
			} );

			await test.step( 'Then I see the Hosting Configuration page', async function () {
				await expect( page ).toHaveURL( /hosting-config/ );
			} );

			await test.step( 'When I click "Open phpMyAdmin" button', async function () {
				const waitForPopup = page.waitForEvent( 'popup' );
				await siteSettingsPage.clickButton( 'Open phpMyAdmin' );
				popupPage = await waitForPopup;
			} );

			await test.step( 'Then the popup URL contains a bearer token', async function () {
				const url = popupPage.url();
				expect( url ).toMatch( /token=([A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$)/ );
			} );

			await test.step( 'And I land in phpMyAdmin', async function () {
				await popupPage.waitForURL( /_pma/ );
				await popupPage.getByRole( 'link', { name: 'phpMyAdmin', exact: true } ).waitFor();
			} );
		} );
	}
);
