/**
 * Shallowly tests the Stats feature, including Jetpack/Odyssey stats.
 *
 * Keywords: Stats, Jetpack, Odyssey Stats
 */

import {
	DataHelper,
	SidebarComponent,
	StatsPage,
	TestAccount,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'Stats' ),
	{ tag: [ tags.CALYPSO_PR, tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ), [
			{ gutenberg: 'stable', siteType: 'simple', accountName: 'defaultUser' },
		] );

		test( 'As a user, I can navigate the Stats sections', async ( { page } ) => {
			let statsPage: StatsPage;

			await test.step( 'Authenticate', async () => {
				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
			} );

			await test.step( 'Navigate to Stats', async () => {
				statsPage = new StatsPage( page );

				if ( envVariables.ATOMIC_VARIATION === 'ecomm-plan' ) {
					await statsPage.visit( DataHelper.getAccountSiteURL( accountName, { protocol: false } ) );
				} else {
					const sidebarComponent = new SidebarComponent( page );
					await sidebarComponent.navigate( 'Stats' );
				}
			} );

			await test.step( 'Click on the Traffic tab', async () => {
				await statsPage.clickTab( 'Traffic' );
			} );

			await test.step( 'Filter traffic activity to Likes', async () => {
				await statsPage.showStatsOfType( { tab: 'Traffic', type: 'Likes' } );
			} );

			await test.step( 'Click on Insights tab', async () => {
				await statsPage.clickTab( 'Insights' );
			} );

			await test.step( 'Click link to see all annual insights', async () => {
				await statsPage.clickViewAllAnnualInsights();
			} );

			await test.step( 'Go back', async () => {
				await page.goBack();
			} );

			await test.step( 'Click on Subscribers tab', async () => {
				await statsPage.clickTab( 'Subscribers' );
			} );

			if ( accountName === 'jetpackAtomicEcommPlanUser' ) {
				await test.step( 'Click on the Store tab', async () => {
					await statsPage.clickTab( 'Store' );
				} );

				await test.step( 'Select "Years" stats period', async () => {
					await statsPage.selectStatsPeriod( 'Years' );
				} );

				await test.step( 'Select "Gross sales" stats type', async () => {
					await statsPage.showStatsOfType( { tab: 'Store', type: 'Gross Sales' } );
				} );
			}
		} );
	}
);
