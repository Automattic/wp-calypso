import { DataHelper, TOTPClient } from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

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

		test( 'As a Woo.com user, I can use a TOTP to secure my account on Woo.com ', async ( {
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
				await pageLogin.visit( { path: secrets.wooLoginPath } );
				await page.waitForURL( /log-in/ );
			} );

			// Wait 30s to avoid OTP code reuse error.
			await test.step( 'And I wait 30 seconds to avoid OTP code reuse error', async function () {
				await page.waitForTimeout( 30000 );
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

			await test.step( 'And I approve logon to woo.com', async function () {
				await page.getByRole( 'button', { name: 'Approve' } ).click();
			} );

			await test.step( 'Then I am redirected to woo.com', async function () {
				await page.waitForURL( /.*woocommerce\.com*/ );
			} );
		} );
	}
);
