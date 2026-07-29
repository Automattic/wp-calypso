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
		const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );
		const testAccount = new TestAccount( accountName );

		test( 'As a user, I can navigate Jetpack Dashboard tabs and Settings', async ( { page } ) => {
			test.skip( envVariables.TEST_ON_ATOMIC !== true, 'Only runs on Atomic sites' );

			let jetpackDashboardPage: JetpackDashboardPage;

			await test.step( 'Authenticate', async () => {
				await testAccount.authenticate( page );
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

			for ( const tab of [
				'Security',
				'Performance',
				'Writing',
				'Sharing',
				'Discussion',
				'Traffic',
				// Parked: the Newsletter tab is not rendered on any of the seven Atomic
				// variations, so clicking it always times out. The pre-migration Jest spec
				// never covered this tab; it was added by the Playwright migration in #112865.
				// 'Newsletter',
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
