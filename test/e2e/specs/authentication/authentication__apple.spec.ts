import { DataHelper } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe( 'Authentication: Apple', { tag: [ tags.AUTHENTICATION ] }, () => {
	test.describe.configure( { mode: 'serial' } ); // Since both tests use the same Apple ID, they should not be run at the same time
	test.skip(
		DataHelper.isCalypsoProduction() === false,
		'Skipping unless running on WordPress.com as Apple authentication requires prod callbacks'
	);
	test.skip(
		true,
		'Skipping Apple authentication tests as they are too unreliable (account gets locked on Apple)'
	);

	test( 'As a WordPress.com user, I can use my Apple Id to authenticate ', async ( {
		clientEmail,
		page,
		pageAppleLogin,
		pageLogin,
		secrets,
	}, workerInfo ) => {
		test.skip(
			workerInfo.project.name !== 'authentication',
			'The authentication project is the only one that has the right browser settings for authentication tests'
		);

		let timestamp: Date;
		let code: string;

		await test.step( 'Given I am on the login page', async function () {
			await pageLogin.visit();
		} );

		await test.step( 'When I click on Login with Apple button', async function () {
			await pageLogin.clickLoginWithApple();
			await page.waitForURL( /.*appleid\.apple\.com\/auth.*/ );
		} );

		await test.step( 'And I enter my Apple ID', async function () {
			await pageAppleLogin.enterEmail( secrets.testAccounts.appleLoginUser.email as string );
			await pageAppleLogin.pressEnter();
		} );

		await test.step( 'And I enter my Apple password', async function () {
			await pageAppleLogin.enterPassword( secrets.testAccounts.appleLoginUser.password );
			await pageAppleLogin.pressEnter();
			timestamp = new Date( Date.now() );
		} );

		await test.step( 'And I handle the 2FA challenge if it appears', async function () {
			const url = page.url();

			// Handle potential 2FA challenge.
			if ( url.includes( 'appleid.apple.com/auth/authorize' ) ) {
				const message = await clientEmail.getLastMatchingMessage( {
					inboxId: secrets.mailosaur.totpUserInboxId,
					receivedAfter: timestamp,
					subject: 'SMS',
					body: 'Your Apple Account code is',
				} );

				code = clientEmail.get2FACodeFromMessage( message );

				await pageAppleLogin.enter2FACode( code );
				await pageAppleLogin.clickButtonWithExactText( 'Trust' );
			}
		} );

		await test.step( 'And I confirm login with Apple ID', async function () {
			await pageAppleLogin.clickButtonContainingText( 'Continue' );
			await page.waitForURL( /.*\/home\/.*/ );
		} );

		await test.step( 'Then I can see My Home on WordPress.com', async function () {
			await expect( page.getByRole( 'heading', { name: 'My Home' } ) ).toBeVisible();
		} );
	} );

	test( 'As a WooCommerce user, I can use my Apple Id to authenticate ', async ( {
		clientEmail,
		environment,
		page,
		pageAppleLogin,
		pageLogin,
		secrets,
	}, workerInfo ) => {
		test.skip(
			workerInfo.project.name !== 'authentication',
			'The authentication project is the only one that has the right browser settings for authentication tests'
		);

		let timestamp: Date;
		let code: string;

		await test.step( 'Given I wait 30 seconds to avoid Apple OTP code reuse error', async function () {
			// Wait 30s to avoid OTP code reuse error.
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

		await test.step( 'When I click on Login with Apple button', async function () {
			await pageLogin.clickLoginWithApple();
			await page.waitForURL( /.*appleid\.apple\.com\/auth.*/ );
		} );

		await test.step( 'And I enter my Apple ID', async function () {
			await pageAppleLogin.enterEmail( secrets.testAccounts.appleLoginUser.email as string );
			await pageAppleLogin.pressEnter();
		} );

		await test.step( 'And I enter my Apple password', async function () {
			await pageAppleLogin.enterPassword( secrets.testAccounts.appleLoginUser.password );
			await pageAppleLogin.pressEnter();
			timestamp = new Date( Date.now() );
		} );

		await test.step( 'And I handle the 2FA challenge if it appears', async function () {
			const url = page.url();

			// Handle potential 2FA challenge.
			if ( url.includes( 'appleid.apple.com/auth/authorize' ) ) {
				const message = await clientEmail.getLastMatchingMessage( {
					inboxId: secrets.mailosaur.totpUserInboxId,
					receivedAfter: timestamp,
					subject: 'SMS',
					body: 'Your Apple Account code is',
				} );

				code = clientEmail.get2FACodeFromMessage( message );

				await pageAppleLogin.enter2FACode( code );
				await pageAppleLogin.clickButtonWithExactText( 'Trust' );
			}
		} );

		await test.step( 'And I confirm login with Apple ID', async function () {
			await pageAppleLogin.clickButtonContainingText( 'Continue' );
		} );

		await test.step( 'And I authorize WPCOM to sign into WooCommerce', async function () {
			await page.addLocatorHandler(
				page.getByRole( 'button', { name: 'Approve' } ),
				async ( locator ) => {
					await locator.click();
				}
			);
		} );

		await test.step( 'Then I am see the my dashboard page on WooCommerce.com', async function () {
			await expect
				.poll( async () => page.url() )
				.toBe( `${ environment.WOO_BASE_URL }/my-dashboard/` );
		} );
	} );
} );
