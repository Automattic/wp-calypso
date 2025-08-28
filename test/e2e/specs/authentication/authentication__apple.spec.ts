import { test, expect } from '../../lib/pw-base';

test.describe( 'Authentication: Apple', () => {
	test.describe.configure( { mode: 'serial' } ); // Since both tests use the same Apple ID, they should not be run at the same time

	let code: string;

	test( 'As a WordPress.com user, I can use my Apple Id to authenticate ', async ( {
		clientEmail,
		page,
		pageAppleLogin,
		pageLogin,
		secrets,
	}, workerInfo ) => {
		test.skip( workerInfo.project.name !== 'chrome', 'We only run Apple Authentication in Chrome' );
		let timestamp: Date;

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
		page,
		pageAppleLogin,
		pageLogin,
		secrets,
	}, workerInfo ) => {
		test.skip( workerInfo.project.name !== 'chrome', 'We only run Apple Authentication in Chrome' );

		let timestamp: Date;

		await test.step( 'Given I am on the login page', async function () {
			await pageLogin.visit( {
				path: secrets.wooLoginPath,
			} );
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
				if ( ! code ) {
					const message = await clientEmail.getLastMatchingMessage( {
						inboxId: secrets.mailosaur.totpUserInboxId,
						receivedAfter: timestamp,
						subject: 'SMS',
						body: 'Your Apple Account code is',
					} );

					code = clientEmail.get2FACodeFromMessage( message );
				}

				await pageAppleLogin.enter2FACode( code );
				await pageAppleLogin.clickButtonWithExactText( 'Trust' );
			}
		} );

		await test.step( 'And I confirm login with Apple ID', async function () {
			await pageAppleLogin.clickButtonContainingText( 'Continue' );
		} );

		await test.step( 'And I athorize WPCOM to sign into WooCommerce', async function () {
			const approveButton = page.locator( 'button:text("Approve")' );
			if ( ( await approveButton.count() ) > 0 ) {
				await approveButton.click();
			}
		} );

		await test.step( 'Then I am redirected to woo.com upon successful login', async function () {
			await page.waitForURL( /.*woocommerce\.com*/ );
		} );
	} );
} );
