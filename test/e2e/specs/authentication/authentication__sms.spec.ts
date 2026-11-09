import { DataHelper, TestAccount } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

/**
 * This test only verifies that a user with SMS-based 2FA can log in.
 * There is a backend limit of one SMS per 5 minutes, so not sure we should even do this
 */

test.describe(
	DataHelper.createSuiteTitle( 'Authentication: SMS' ),
	{ tag: [ tags.AUTHENTICATION ] },
	() => {
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

			const testAccount = new TestAccount( 'smsUser' );

			// The assertions run inside the lock: they check the session this login creates.
			await testAccount.logInExclusively( async () => {
				await test.step( 'When I log in as a user with 2fa', async function () {
					await testAccount.logInViaLoginPage( page );
				} );

				// Simple sites without a saved admin interface style default to Classic, so the
				// account lands on its site's wp-admin Dashboard rather than Calypso's My Home.
				await test.step( 'Then I am on my landing page', async function () {
					await expect(
						page
							.getByRole( 'heading', { name: 'My Home' } )
							.or( page.getByRole( 'heading', { name: 'Dashboard', level: 1 } ) )
					).toBeVisible( { timeout: 30_000 } );
				} );
			} );
		} );
	}
);
