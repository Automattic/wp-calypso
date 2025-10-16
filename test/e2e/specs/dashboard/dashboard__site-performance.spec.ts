import { DataHelper } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe( 'Dashboard: Site Performance', { tag: [ tags.CALYPSO_PR ] }, () => {
	test.skip(
		DataHelper.isCalypsoProduction(),
		'Skipping for WordPress.com as v2 dashboard is not enabled yet.'
	);

	test( 'As a WordPress.com user, I am offered the ability to upgrade to a paid plan to access the site performance page', async ( {
		pageDashboard,
		pageDashboardPerformance,
		sitePublic,
	} ) => {
		await test.step( "Given I am on my public site's performance page", async function () {
			await pageDashboard.visitPath( `sites/${ sitePublic.blog_details.site_slug }/performance` );
		} );

		await test.step( 'I see the feature upgrade window', async function () {
			await expect
				.poll( async () => await pageDashboardPerformance.isFeatureGateVisible() )
				.toBe( true );
		} );
	} );

	test( 'As a WordPress.com user, I am able to view my performance report.', async ( {
		accountAtomic,
		pageDashboard,
		pageDashboardPerformance,
		page,
	} ) => {
		await test.step( `Given I am authenticated as '${ accountAtomic.accountName }'`, async function () {
			await accountAtomic.authenticate( page );
		} );

		await test.step( "Given I am on my public site's performance page", async function () {
			await pageDashboard.visitPath(
				`sites/${ accountAtomic.getSiteURL( { protocol: false } ) }/performance`
			);
		} );

		await test.step( 'I see the loading indicator.', async function () {
			await expect
				.poll( async () => await pageDashboardPerformance.isReportLoading() )
				.toBe( true );
		} );

		await test.step( 'I wait for loading to finish.', async function () {
			await pageDashboardPerformance.waitForLoadingToFinish();
		} );

		await test.step( 'I see my report.', async function () {
			await expect
				.poll( async () => await pageDashboardPerformance.isReportVisible() )
				.toBe( true );
		} );
	} );
} );
