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

	const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ), [
		{ gutenberg: 'stable', siteType: 'simple', accountName: 'defaultUser' },
	] );

	beforeAll( async () => {
		page = await browser.newPage();

		testAccount = new TestAccount( accountName );
		if ( testAccount.accountName === 'jetpackAtomicEcommPlanUser' ) {
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

		it( 'Select "Months" stats period', async function () {
			await statsPage.selectStatsPeriodFromDropdown( 'Months' );
		} );

		it( 'Filter traffic activity to Likes', async function () {
			await statsPage.showStatsOfType( { tab: 'Traffic', type: 'Likes' } );
		} );
	} );

	describe( 'Insights', function () {
		it( 'Click on Insights tab', async function () {
			await statsPage.clickTab( 'Insights' );
		} );

		it( 'Click link to see all annual insights', async function () {
			await statsPage.clickViewAllAnnualInsights();
			// Right now, we can't actually verify stats data because if run right after a test site purge,
			// there may be nothing in there. We just verify that we can get to the page.

			// TODO: find a reliable way to extend this to check data too.
		} );

		it( 'Go back', async function () {
			await page.goBack();
		} );
	} );

	describe( 'Subscribers', function () {
		it( 'Click on Subscribers tab', async function () {
			await statsPage.clickTab( 'Subscribers' );
		} );
	} );

	// The Store tab is not present unless Business or higher plan is on the site and the
	// site has gone AT.
	skipDescribeIf( accountName !== 'jetpackAtomicEcommPlanUser' )( 'Store', function () {
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
