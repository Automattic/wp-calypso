import { DataHelper } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe( 'Dashboard: Basic & Routing', { tag: [ tags.CALYPSO_PR ] }, () => {
	test.skip(
		DataHelper.isCalypsoProduction(),
		'Skipping for WordPress.com as v2 dashboard is not enabled yet.'
	);

	test( 'As a WordPress.com user, I can see the new v2 dashboard page as a list of my sites', async ( {
		accountGivenByEnvironment,
		page,
		pageDashboard,
	} ) => {
		await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async function () {
			await accountGivenByEnvironment.authenticate( page );
		} );

		await test.step( 'When I visit the dashboard page', async function () {
			await pageDashboard.visit();
		} );

		await test.step( 'Then I see the WordPress.com v2 dashboard page (list of sites)', async function () {
			expect( await pageDashboard.isLoaded() ).toBe( true );
			expect( await pageDashboard.getHeadingText() ).toEqual( 'Sites' );
		} );
	} );

	test( 'As a WordPress.com user, I can see a 404 page for a non-existent dashboard page', async ( {
		accountGivenByEnvironment,
		page,
		pageDashboard,
	} ) => {
		await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async function () {
			await accountGivenByEnvironment.authenticate( page );
		} );

		await test.step( 'When I visit the dashboard page', async function () {
			await pageDashboard.visitPath( 'non-existent-page' );
		} );

		await test.step( 'Then I see a 404 error page', async function () {
			await expect.poll( async () => await pageDashboard.is404Page() ).toBe( true );
		} );
	} );
} );
