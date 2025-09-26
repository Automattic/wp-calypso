import { DataHelper, TOTPClient } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe(
	'Authentication: Time-based One Time Passcode (TOTP)',
	{ tag: [ tags.AUTHENTICATION ] },
	() => {
		test.describe.configure( { mode: 'serial' } ); // Since both tests use the same TOTP, they should not be run at the same time
		test.skip(
			DataHelper.isCalypsoProduction() === false,
			'Skipping unless running on WordPress.com'
		);

		test( 'As a WordPress.com user, I can use a TOTP to secure my account on WordPress.com ', async ( {
			page,
			pageLogin,
			secrets,
		}, workerInfo ) => {
			test.skip(
				workerInfo.project.name !== 'authentication',
				'The authentication project is the only one that has the right browser settings for authentication tests'
			);

			const credentials = secrets.testAccounts.totpUser;

			await test.step( 'When I visit the WordPress.com login page', async function () {
				await page.goto(
					DataHelper.getCalypsoURL(
						`log-in?site=${ credentials.primarySite }&redirect_to=%2Fplans%2F${ credentials.primarySite }`
					)
				);
				await page.waitForURL( /log-in/ );
			} );

			await test.step( 'And I enter my username', async function () {
				await pageLogin.fillUsername( credentials.username as string );
				await pageLogin.clickSubmit();
			} );

			await test.step( 'And I enter my password', async function () {
				await pageLogin.fillPassword( credentials.password );
			} );

			await test.step( 'And I submit the login form', async function () {
				await pageLogin.clickSubmit();
			} );

			await test.step( 'And I enter my TOTP code', async function () {
				const totpClient = new TOTPClient( credentials.totpKey as string );
				const code = totpClient.getToken();
				await pageLogin.submitVerificationCode( code );
			} );

			await test.step( 'Then I am redirected to Settings > Plans', async function () {
				const redirectedURL = DataHelper.getCalypsoURL( '/plans' );
				await page.waitForURL( `${ redirectedURL }/${ credentials.primarySite }` );
			} );
		} );

		test( 'As a WooCommerce.com user, I can use a TOTP to secure my account on WooCommerce.com ', async ( {
			page,
			pageLogin,
			secrets,
			environment,
		}, workerInfo ) => {
			test.skip(
				workerInfo.project.name !== 'authentication',
				'The authentication project is the only one that has the right browser settings for authentication tests.'
			);

			const credentials = secrets.testAccounts.totpUser;

			// Wait 30s to avoid OTP code reuse error.
			await test.step( 'Given I wait 30 seconds to avoid OTP code reuse error', async function () {
				await page.waitForTimeout( 30000 );
			} );

			await test.step( 'When I visit the WooCommerce home page', async function () {
				await page.goto( environment.WOO_BASE_URL );
			} );

			await test.step( 'And I choose to log in', async function () {
				await page.getByRole( 'link', { name: 'Log in' } ).click();
			} );

			await test.step( 'Then I see the WordPress.com log in page', async function () {
				await expect(
					page.getByRole( 'heading', { name: 'Log in to Woo with WordPress.com' } )
				).toBeVisible();
			} );

			await test.step( 'When I enter my username', async function () {
				await pageLogin.fillUsername( credentials.username as string );
				await pageLogin.clickSubmit();
			} );

			await test.step( 'And I enter my password', async function () {
				await pageLogin.fillPassword( credentials.password );
			} );

			await test.step( 'And I submit the login form', async function () {
				await pageLogin.clickSubmit();
			} );

			await test.step( 'And I enter my TOTP code', async function () {
				const totpClient = new TOTPClient( credentials.totpKey as string );
				const code = totpClient.getToken();
				await pageLogin.submitVerificationCode( code );
			} );

			await test.step( 'Then I am see the my dashboard page on WooCommerce.com', async function () {
				await expect
					.poll( async () => page.url() )
					.toBe( `${ environment.WOO_BASE_URL }/my-dashboard/` );
			} );
		} );
	}
);
