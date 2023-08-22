/**
 * @group calypso-pr
 * @group jetpack-wpcom-integration
 */

import {
	DataHelper,
	StatsPage,
	SidebarComponent,
	TestAccount,
	getTestAccountByFeature,
	envToFeatureKey,
	envVariables,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { skipDescribeIf } from '../../jest-helpers';

declare const browser: Browser;

/**
 * Shallowly tests the Stats feature, including Jetpack/Odyssey stats.
 *
 * Keywords: Stats, Jetpack, Odyssey Stats
 */
describe( DataHelper.createSuiteTitle( 'Stats' ), function () {
	let page: Page;
	let testAccount: TestAccount;
	let statsPage: StatsPage;

	const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );

	beforeAll( async () => {
		page = await browser.newPage();

		testAccount = new TestAccount( accountName );
		if ( accountName === 'jetpackAtomicEcommPlanUser' ) {
			// eCommerce plan sites attempt to load Calypso, but with
			// third-party cookies disabled the fallback route to WP-Admin
			// kicks in after some time.
			await testAccount.authenticate( page, { url: /wp-admin/ } );
		} else {
			await testAccount.authenticate( page );
		}
	} );

	it( 'Navigate to Stats', async function () {
		statsPage = new StatsPage( page );

		if ( envVariables.ATOMIC_VARIATION === 'ecomm-plan' ) {
			return await statsPage.visit(
				DataHelper.getAccountSiteURL( accountName, { protocol: false } )
			);
		}
		const sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.navigate( 'Stats' );
	} );

	describe( 'Traffic', function () {
		it( 'Click on the Traffic tab', async function () {
			await statsPage.clickTab( 'Traffic' );
		} );

		it( 'View 30-day highlights', async function () {
			await statsPage.selectHighlightPeriod( '30-day' );
		} );

		it( 'Select "Months" stats period', async function () {
			await statsPage.selectStatsPeriod( 'Months' );
		} );

		it( 'Filter traffic activity to Likes', async function () {
			await statsPage.showStatsOfType( { tab: 'Traffic', type: 'Likes' } );
		} );

		it( 'Filter traffic activity to Comments', async function () {
			await statsPage.showStatsOfType( { tab: 'Traffic', type: 'Visitors' } );
		} );
	} );

	describe( 'Insights', function () {
		it( 'Click on Insights tab', async function () {
			await statsPage.clickTab( 'Insights' );
		} );

		it( 'Click link to see all annual insights', async function () {
			await statsPage.clickViewAllAnnualInsights();

			await statsPage.annualInsightPresentForYear( 2023 );
		} );

		it( 'Go back', async function () {
			await page.goBack();
		} );
	} );

	describe( 'Subscribers', function () {
		it( 'Click on Subscribers tab', async function () {
			await statsPage.clickTab( 'Subscribers' );
		} );

		it( 'Click link to see all annual insights', async function () {
			await statsPage.selectSubscriberType( 'Email' );
		} );
	} );

	// While not strictly true (there can be AT sites without stores enabled),
	// for the purpose of test accounts this is a sufficient comparison.
	// The Store tab is only available to those on Business and higher plans.
	skipDescribeIf( envVariables.TEST_ON_ATOMIC === false )( 'Store', function () {
		it( 'Click on the Store tab', async function () {
			await statsPage.clickTab( 'Store' );
		} );

		it( 'Select "Years" stats period', async function () {
			await statsPage.selectStatsPeriod( 'Years' );
		} );

		it( 'Select "Gross sales" stats type', async function () {
			await statsPage.showStatsOfType( { tab: 'Store', type: 'Gross Sales' } );
		} );
	} );
} );
