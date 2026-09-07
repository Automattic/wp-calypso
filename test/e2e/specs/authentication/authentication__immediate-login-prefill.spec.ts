import { DataHelper } from '@automattic/calypso-e2e';
import { tags, test, expect } from '../../lib/pw-base';

test.describe(
	'Authentication: Immediate login email prefill',
	{ tag: [ tags.AUTHENTICATION, tags.CALYPSO_RELEASE ] },
	() => {
		const email = 'e2e-immediate-login@example.com';

		test( 'A failed immediate login reaches the login form with the email prefilled', async ( {
			page,
		} ) => {
			await test.step( 'Given I follow an immediate login link that did not log me in', async function () {
				await page.goto(
					DataHelper.getCalypsoURL( 'me/purchases', {
						immediate_login_attempt: '1',
						login_email: email,
					} ),
					{ waitUntil: 'domcontentloaded' }
				);
			} );

			await test.step( 'Then I am redirected to the login form', async function () {
				await page.waitForURL( /\/log-in/, { timeout: 30_000 } );
			} );

			await test.step( 'And the email field holds the address from the link', async function () {
				const usernameInput = page.getByRole( 'textbox', {
					name: /email address|username/i,
				} );
				await expect( usernameInput ).toHaveValue( email, { timeout: 15_000 } );
			} );
		} );
	}
);
