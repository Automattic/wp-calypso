import { DataHelper, TestAccount } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

/**
 * This test only verifies that a user with SMS-based 2FA can log in.
 * There is a backend limit of one SMS per 5 minutes, so not sure we should even do this
 */

test.describe( 'Authentication: SMS', { tag: [ tags.AUTHENTICATION ] }, () => {
	test.skip(
		DataHelper.isCalypsoProduction() === false,
		'Skipping unless running on WordPress.com'
	);

	test( 'As a WordPress.com user, I can require 2fa via SMS', async ( { page }, workerInfo ) => {
		test.skip(
			workerInfo.project.name !== 'authentication',
			'The authentication project is the only one that has the right browser settings for authentication tests'
		);
		// This should not be smaller than the timeout in the email client: {@link EmailClient.getLastMatchingMessage}
		test.setTimeout( 130_000 );

		await test.step( 'When I log in as a user with 2fa', async function () {
			const testAccount = new TestAccount( 'smsUser' );
			await testAccount.logInViaLoginPage( page );
		} );

		await test.step( 'Then I am on the home page', async function () {
			await page.waitForURL( /home/ );
			await expect( page.getByRole( 'heading', { name: 'My Home' } ) ).toBeVisible();
		} );
	} );
} );
