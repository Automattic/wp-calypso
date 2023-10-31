/**
 * @group jetpack-wpcom-integration
 */

import {
	DataHelper,
	TestAccount,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
	JetpackDashboardPage,
	DashboardTabs,
	SettingsTabs,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { skipDescribeIf, skipItIf } from '../../jest-helpers';

declare const browser: Browser;

/**
 * Smoke tests the various screens added to wp-admin by Jetpack.
 *
 * This test is basic and only checks whether the hidden screen-reader title element
 * is present.
 *
 * Keywords: Jetpack, Smoke Test
 */
skipDescribeIf( envVariables.TEST_ON_ATOMIC !== true )(
	DataHelper.createSuiteTitle( 'Jetpack: Dashboard Smoke Test' ),
	function () {
		const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );
		const testAccount = new TestAccount( accountName );

		let page: Page;
		let jetpackDashboardPage: JetpackDashboardPage;

		beforeAll( async function () {
			page = await browser.newPage();

			if ( accountName === 'jetpackAtomicEcommPlanUser' ) {
				// eCommerce plan sites attempt to load Calypso, but with
				// third-party cookies disabled the fallback route to WP-Admin
				// kicks in after some time.
				await testAccount.authenticate( page, { url: /wp-admin/ } );
			} else {
				await testAccount.authenticate( page );
			}

			jetpackDashboardPage = new JetpackDashboardPage( page );
		} );

		it( 'Navigate to Jetpack dashboard', async function () {
			await jetpackDashboardPage.visit( testAccount.getSiteURL( { protocol: false } ) );
		} );

		describe( 'Dashboard', function () {
			it.each( [ { tab: 'At a Glance' }, { tab: 'My Plan' } ] )(
				'Click on $tab tab in the Dashboard view',
				async function ( { tab } ) {
					await jetpackDashboardPage.clickTab( { view: 'Dashboard', tab: tab as DashboardTabs } );

					await page
						.getByRole( 'heading', { name: tab, level: 1 } )
						.waitFor( { state: 'attached' } );
				}
			);
		} );

		describe( 'Settings', function () {
			it.each( [
				{ tab: 'Security' },
				{ tab: 'Performance' },
				{ tab: 'Writing' },
				{ tab: 'Sharing' },
				{ tab: 'Discussion' },
				{ tab: 'Traffic' },
				{ tab: 'Newsletter' },
			] )( 'Click on $tab tab in the Settings view', async function ( { tab } ) {
				await jetpackDashboardPage.clickTab( { view: 'Settings', tab: tab as SettingsTabs } );

				await page.getByRole( 'heading', { name: tab, level: 1 } ).waitFor( { state: 'attached' } );
			} );

			skipItIf( envVariables.ATOMIC_VARIATION === 'private' )(
				'Click on Earn tab in the Settings view',
				async function () {
					await jetpackDashboardPage.clickTab( { view: 'Settings', tab: 'Monetize' } );

					await page
						.getByRole( 'heading', { name: 'Monetize', level: 1 } )
						.waitFor( { state: 'attached' } );
				}
			);
		} );
	}
);
