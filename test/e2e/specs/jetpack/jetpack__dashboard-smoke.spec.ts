/**
 * Smoke tests the various screens added to wp-admin by Jetpack.
 *
 * This test is basic and only checks whether the hidden screen-reader title element
 * is present.
 *
 * Keywords: Jetpack, Smoke Test
 */

import {
	DataHelper,
	DashboardTabs,
	JetpackDashboardPage,
	SettingsTabs,
	TestAccount,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'Jetpack: Dashboard Smoke Test' ),
	{ tag: [ tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		test( 'As a user, I can navigate Jetpack Dashboard tabs and Settings', async ( { page } ) => {
			test.skip( envVariables.TEST_ON_ATOMIC !== true, 'Only runs on Atomic sites' );

			// Must resolve inside the test: a throw at describe scope aborts collection for the entire run.
			const testAccount = new TestAccount(
				getTestAccountByFeature( envToFeatureKey( envVariables ) )
			);
			let jetpackDashboardPage: JetpackDashboardPage;

			await test.step( 'Authenticate', async () => {
				await testAccount.authenticate( page, { waitUntilStable: false } );
				jetpackDashboardPage = new JetpackDashboardPage( page );

				// Atomic tests sites might have local users, so the Jetpack SSO login will
				// show up when visiting the Jetpack dashboard directly.
				const siteUrl = testAccount.getSiteURL( { protocol: true } );
				await page.goto( `${ siteUrl }wp-admin/`, {
					timeout: 15 * 1000,
					referer: 'https://wordpress.com/',
				} );
			} );

			await test.step( 'Navigate to Jetpack dashboard', async () => {
				await jetpackDashboardPage.visit( testAccount.getSiteURL( { protocol: false } ) );
			} );

			for ( const tab of [ 'At a Glance', 'My Plan' ] as DashboardTabs[] ) {
				await test.step( `Click on ${ tab } tab in the Dashboard view`, async () => {
					await jetpackDashboardPage.clickTab( { view: 'Dashboard', tab } );
					await page
						.getByRole( 'heading', { name: tab, level: 1 } )
						.waitFor( { state: 'attached' } );
				} );
			}

			// Newsletter is deliberately absent: Jetpack does not render that tab on any Atomic
			// variation, and this test only runs on Atomic. See TESTOPS-148.
			for ( const tab of [
				'Security',
				'Performance',
				'Writing',
				'Sharing',
				'Discussion',
				'Traffic',
			] as SettingsTabs[] ) {
				await test.step( `Click on ${ tab } tab in the Settings view`, async () => {
					await jetpackDashboardPage.clickTab( { view: 'Settings', tab } );
				} );
			}

			if ( envVariables.ATOMIC_VARIATION !== 'private' ) {
				await test.step( 'Click on Monetize tab in the Settings view', async () => {
					await jetpackDashboardPage.clickTab( { view: 'Settings', tab: 'Monetize' } );
				} );
			}
		} );
	}
);
