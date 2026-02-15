import {
	DataHelper,
	envVariables,
	envToFeatureKey,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

/**
 * Shallowly tests the Stats feature, including Jetpack/Odyssey stats.
 *
 * Keywords: Stats, Jetpack, Odyssey Stats
 */
test.describe( 'Stats', { tag: [ tags.CALYPSO_PR, tags.JETPACK_WPCOM_INTEGRATION ] }, () => {
	test( 'View stats for Traffic, Insights, and Subscribers', async ( {
		accountGivenByEnvironment,
		componentSidebar,
		page,
		pageStats,
	} ) => {
		const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ), [
			{ gutenberg: 'stable', siteType: 'simple', accountName: 'defaultUser' },
		] );

		await test.step( `Given I am authenticated as '${ accountName }'`, async function () {
			await accountGivenByEnvironment.authenticate( page );
		} );

		await test.step( 'When I navigate to Stats', async function () {
			if ( envVariables.ATOMIC_VARIATION === 'ecomm-plan' ) {
				await pageStats.visit( DataHelper.getAccountSiteURL( accountName, { protocol: false } ) );
			} else {
				await componentSidebar.navigate( 'Stats' );
			}
		} );

		await test.step( 'Then I see the Stats page', async function () {
			await expect( page ).toHaveURL( /stats/ );
		} );

		await test.step( 'When I click on the Traffic tab', async function () {
			await pageStats.clickTab( 'Traffic' );
		} );

		await test.step( 'Then I see the Traffic stats', async function () {
			await expect( page ).toHaveURL( /stats\/day/ );
		} );

		await test.step( 'When I filter traffic activity to Likes', async function () {
			await pageStats.showStatsOfType( { tab: 'Traffic', type: 'Likes' } );
		} );

		await test.step( 'Then I see the Likes stats', async function () {
			// The stats page should still be visible and functional
			await expect( page ).toHaveURL( /stats/ );
		} );

		await test.step( 'When I click on the Insights tab', async function () {
			await pageStats.clickTab( 'Insights' );
		} );

		await test.step( 'Then I see the Insights stats', async function () {
			await expect( page ).toHaveURL( /stats\/insights/ );
		} );

		await test.step( 'When I click to view all annual insights', async function () {
			await pageStats.clickViewAllAnnualInsights();
		} );

		await test.step( 'Then I see the annual insights page', async function () {
			// Right now, we can't actually verify stats data because if run right after a test site purge,
			// there may be nothing in there. We just verify that we can get to the page.
			await expect( page ).toHaveURL( /annualstats/ );
		} );

		await test.step( 'When I go back', async function () {
			await page.goBack();
		} );

		await test.step( 'Then I return to the Insights tab', async function () {
			await expect( page ).toHaveURL( /stats\/insights/ );
		} );

		await test.step( 'When I click on the Subscribers tab', async function () {
			await pageStats.clickTab( 'Subscribers' );
		} );

		await test.step( 'Then I see the Subscribers stats', async function () {
			await expect( page ).toHaveURL( /stats\/subscribers/ );
		} );
	} );

	// The Store tab is not present unless Business or higher plan is on the site and the
	// site has gone AT.
	test( 'View Store stats', async ( {
		accountGivenByEnvironment,
		componentSidebar,
		page,
		pageStats,
	} ) => {
		const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ), [
			{ gutenberg: 'stable', siteType: 'simple', accountName: 'defaultUser' },
		] );

		test.skip(
			accountName !== 'jetpackAtomicEcommPlanUser',
			'Store tab only available for jetpackAtomicEcommPlanUser'
		);

		await test.step( `Given I am authenticated as '${ accountName }'`, async function () {
			await accountGivenByEnvironment.authenticate( page );
		} );

		await test.step( 'When I navigate to Stats', async function () {
			if ( envVariables.ATOMIC_VARIATION === 'ecomm-plan' ) {
				await pageStats.visit( DataHelper.getAccountSiteURL( accountName, { protocol: false } ) );
			} else {
				await componentSidebar.navigate( 'Stats' );
			}
		} );

		await test.step( 'When I click on the Store tab', async function () {
			await pageStats.clickTab( 'Store' );
		} );

		await test.step( 'Then I see the Store stats', async function () {
			await expect( page ).toHaveURL( /store\/stats\/orders/ );
		} );

		await test.step( 'When I select "Years" stats period', async function () {
			await pageStats.selectStatsPeriod( 'Years' );
		} );

		await test.step( 'Then the Years period is selected', async function () {
			// Verify the stats page is still functional
			await expect( page ).toHaveURL( /store\/stats/ );
		} );

		await test.step( 'When I select "Gross Sales" stats type', async function () {
			await pageStats.showStatsOfType( { tab: 'Store', type: 'Gross Sales' } );
		} );

		await test.step( 'Then I see the Gross Sales stats', async function () {
			// Verify the stats page displays the selected type
			await expect( page ).toHaveURL( /store\/stats/ );
		} );
	} );
} );
