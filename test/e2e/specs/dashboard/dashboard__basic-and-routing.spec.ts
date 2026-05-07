import { expect, tags, test } from '../../lib/pw-base';

test.describe(
	'Dashboard: Basic & Routing',
	{ tag: [ tags.DASHBOARD_PR, tags.CALYPSO_RELEASE ] },
	() => {
		test( 'As a WordPress.com user, I can see the new Multi-site Dashboard page as a list of my sites', async ( {
			accountGivenByEnvironment,
			page,
			pageDashboard,
		} ) => {
			await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async function () {
				// Skip waiting for Calypso sidebar — we navigate to the dashboard immediately after.
				await accountGivenByEnvironment.authenticate( page, { waitUntilStable: false } );
			} );

			await test.step( 'When I visit the dashboard page', async function () {
				await pageDashboard.visit();
			} );

			await test.step( 'Then I see the WordPress.com Multi-site Dashboard page (list of sites)', async function () {
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
				// Skip waiting for Calypso sidebar — we navigate to the dashboard immediately after.
				await accountGivenByEnvironment.authenticate( page, { waitUntilStable: false } );
			} );

			await test.step( 'When I visit the dashboard page', async function () {
				await pageDashboard.visitPath( 'me/non-existent-page' );
			} );

			await test.step( 'Then I see a 404 error page', async function () {
				await expect.poll( async () => await pageDashboard.is404Page() ).toBe( true );
			} );
		} );
	}
);
