import { test, expect } from '../../lib/pw-base';

test.describe( 'Dashboard: Authentication', { tag: [ '@dashboard' ] }, () => {
	test.skip(
		! process.env.CALYPSO_BASE_URL || process.env.CALYPSO_BASE_URL === 'https://wordpress.com',
		'Skipping for wordpress.com or if CALYPSO_BASE_URL is undefined, as v2 dashboard is not enabled yet.'
	);

	test( 'As an anonymous user, I can not see the dashboard page unless I am authenticated', async ( {
		pageDashboard,
	} ) => {
		await test.step( 'When I visit the dashboard page without logging in', async function () {
			await pageDashboard.visit();
		} );

		await test.step( 'Then I see the WordPress.com login page', async function () {
			await expect( pageDashboard.page ).toHaveURL( /.*\/log-in/ );
		} );
	} );
} );
