import {
	DataHelper,
	StatsPage,
	SidebarComponent,
	TestAccount,
	getTestAccountByFeature,
	envToFeatureKey,
	envVariables,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

/**
 * Shallowly tests the Stats feature, including Jetpack/Odyssey stats.
 *
 * Keywords: Stats, Jetpack, Odyssey Stats
 */
test.describe( 'Stats', { tag: [ tags.CALYPSO_PR, tags.JETPACK_WPCOM_INTEGRATION ] }, () => {
	const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ), [
		{ gutenberg: 'stable', siteType: 'simple', accountName: 'defaultUser' },
	] );

	test( 'As a user, I can browse the Traffic, Insights and Subscribers stats', async ( {
		page,
	} ) => {
		let statsPage: StatsPage;

		await test.step( 'Authenticate and setup the test', async () => {
			const testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );
		} );

		await test.step( 'Navigate to Stats', async () => {
			statsPage = new StatsPage( page );

			if ( envVariables.ATOMIC_VARIATION === 'ecomm-plan' ) {
				return await statsPage.visit(
					DataHelper.getAccountSiteURL( accountName, { protocol: false } )
				);
			}
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Stats' );
		} );

		// Traffic

		await test.step( 'Click on the Traffic tab', async () => {
			await statsPage.clickTab( 'Traffic' );
		} );

		// TODO: Check if this step should be skipped.
		// await test.step( 'Select "Months" stats period', async () => {
		// 	await statsPage.selectStatsPeriodFromDropdown( 'Months' );
		// } );

		await test.step( 'Filter traffic activity to Likes', async () => {
			await statsPage.showStatsOfType( { tab: 'Traffic', type: 'Likes' } );
		} );

		// Insights

		await test.step( 'Click on Insights tab', async () => {
			await statsPage.clickTab( 'Insights' );
		} );

		await test.step( 'Click link to see all annual insights', async () => {
			await statsPage.clickViewAllAnnualInsights();
			// Right now, we can't actually verify stats data because if run right after a test site purge,
			// there may be nothing in there. We just verify that we can get to the page.

			// TODO: find a reliable way to extend this to check data too.
		} );

		await test.step( 'Go back', async () => {
			await page.goBack();
		} );

		// Subscribers

		await test.step( 'Click on Subscribers tab', async () => {
			await statsPage.clickTab( 'Subscribers' );
		} );

		// The Store tab is not present unless Business or higher plan is on the site and the
		// site has gone AT.
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
} );
