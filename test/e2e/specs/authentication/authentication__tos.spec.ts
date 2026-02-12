import { DataHelper } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe( 'Authentication: TOS', { tag: [ tags.AUTHENTICATION ] }, () => {
	test.skip(
		DataHelper.isCalypsoProduction() === false,
		'Skipping unless running on WordPress.com'
	);

	test( 'As a WordPress.com user, I can see Terms of Service (TOS) text', async ( {
		page,
		pageLogin,
	}, workerInfo ) => {
		test.skip(
			workerInfo.project.name !== 'authentication',
			'The authentication project is the only one that has the right browser settings for authentication tests'
		);

		await test.step( 'When I visit the WordPress.com login page', async function () {
			await pageLogin.visit();
			await page.waitForURL( /log-in/ );
		} );

		await test.step( 'Then I see the correct Terms of Service (TOS) text', async function () {
			await expect(
				page.getByText(
					// WARNING! Please contact the legal team if this text changes!
					'By continuing with any of the options below, you agree to our Terms of Service and have read our Privacy Policy.'
				)
			).toBeVisible();
		} );
	} );
} );
