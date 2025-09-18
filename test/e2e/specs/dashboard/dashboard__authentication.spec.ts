import { DataHelper } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe( 'Dashboard: Authentication', { tag: [ tags.CALYPSO_PR ] }, () => {
	test.skip(
		DataHelper.isCalypsoProduction(),
		'Skipping for WordPress.com as v2 dashboard is not enabled yet.'
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
