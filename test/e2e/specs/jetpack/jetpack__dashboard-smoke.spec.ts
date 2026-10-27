/**
 * Smoke tests the Jetpack Settings screen in wp-admin.
 *
 * This test is basic and only checks that each Settings tab can be selected.
 *
 * Keywords: Jetpack, Smoke Test
 */

import {
	DataHelper,
	JetpackDashboardPage,
	SettingsTabs,
	TestAccount,
	completeJetpackSso,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'Jetpack: Dashboard Smoke Test' ),
	{ tag: [ tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		test( 'As a user, I can navigate the Jetpack Settings tabs', async ( { page } ) => {
			test.skip( envVariables.TEST_ON_ATOMIC !== true, 'Only runs on Atomic sites' );

			// Must resolve inside the test: a throw at describe scope aborts collection for the entire run.
			const testAccount = new TestAccount(
				getTestAccountByFeature( envToFeatureKey( envVariables ) )
			);
			let jetpackDashboardPage: JetpackDashboardPage;

			await test.step( 'Authenticate', async () => {
				await testAccount.authenticate( page );
				jetpackDashboardPage = new JetpackDashboardPage( page );

				// A referer that looks like Calypso gets the site to skip the Jetpack SSO screen
				// most of the time; `completeJetpackSso` covers the rest. `domcontentloaded` is
				// enough because the next step navigates away, while "load" would sit through the
				// dashboard's Site widget iframing a whole front-end page.
				await page.goto( `${ testAccount.getSiteURL( { protocol: true } ) }wp-admin/`, {
					waitUntil: 'domcontentloaded',
					referer: 'https://wordpress.com/',
				} );
				await completeJetpackSso( page );
			} );

			await test.step( 'Navigate to Jetpack Settings', async () => {
				await jetpackDashboardPage.visit( testAccount.getSiteURL( { protocol: false } ) );
			} );

			for ( const tab of [
				'Security',
				'Performance',
				'Writing',
				'Sharing',
				'Discussion',
				'Traffic',
			] as SettingsTabs[] ) {
				await test.step( `Click on ${ tab } tab in the Settings view`, async () => {
					await jetpackDashboardPage.clickTab( tab );
				} );
			}

			if ( envVariables.ATOMIC_VARIATION !== 'private' ) {
				await test.step( 'Click on Monetize tab in the Settings view', async () => {
					await jetpackDashboardPage.clickTab( 'Monetize' );
				} );
			}
		} );
	}
);
