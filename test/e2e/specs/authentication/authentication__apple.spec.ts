import { AppleLoginPage, EmailClient, LoginPage, SecretsManager } from '@automattic/calypso-e2e';
import { test, expect } from '../../lib/pw_base';

test.describe( 'Authentication: Apple', () => {
	test.describe.configure( { mode: 'serial' } ); // Since both tests use the same Apple ID, they shoudl not be run at the same time

	test( 'As a WordPress.com user, I can use my Apple Id to authenticate ', async ( { page } ) => {
		let loginPage: LoginPage;
		let appleLoginPage: AppleLoginPage;
		const credentials = SecretsManager.secrets.testAccounts.appleLoginUser;
		let timestamp: Date;

		await test.step( 'Given I am on the login page', async function () {
			loginPage = new LoginPage( page );
			await loginPage.visit();
		} );

		await test.step( 'When I click on Login with Apple button', async function () {
			await loginPage.clickLoginWithApple();
			await page.waitForURL( /.*appleid\.apple\.com\/auth.*/ );
		} );

		await test.step( 'And I enter my Apple ID', async function () {
			appleLoginPage = new AppleLoginPage( page );
			await appleLoginPage.enterEmail( credentials.email as string );
			await appleLoginPage.pressEnter();
		} );

		await test.step( 'And I enter my Apple password', async function () {
			await appleLoginPage.enterPassword( credentials.password );
			await appleLoginPage.pressEnter();
			timestamp = new Date( Date.now() );
		} );

		await test.step( 'And I handle the 2FA challenge if it appears', async function () {
			const url = page.url();

			// Handle potential 2FA challenge.
			if ( url.includes( 'appleid.apple.com/auth/authorize' ) ) {
				const emailClient = new EmailClient();
				const message = await emailClient.getLastMatchingMessage( {
					inboxId: SecretsManager.secrets.mailosaur.totpUserInboxId,
					receivedAfter: timestamp,
					subject: 'SMS',
					body: 'Your Apple Account code is',
				} );

				const code = emailClient.get2FACodeFromMessage( message );

				await appleLoginPage.enter2FACode( code );
				await appleLoginPage.clickButtonWithExactText( 'Trust' );
			}
		} );

		await test.step( 'And I confirm login with Apple ID', async function () {
			await appleLoginPage.clickButtonContainingText( 'Continue' );
			await page.waitForURL( /.*\/home\/.*/ );
		} );

		await test.step( 'Then I can see My Home on WordPress.com', async function () {
			await expect( page.getByRole( 'heading', { name: 'My Home' } ) ).toBeVisible();
		} );
	} );

	test( 'As a WooCommerce user, I can use my Apple Id to authenticate ', async ( { page } ) => {
		let loginPage: LoginPage;
		let appleLoginPage: AppleLoginPage;
		const credentials = SecretsManager.secrets.testAccounts.appleLoginUser;
		let timestamp: Date;

		await test.step( 'Given I am on the login page', async function () {
			loginPage = new LoginPage( page );
			await loginPage.visit( {
				path: SecretsManager.secrets.wooLoginPath,
			} );
		} );

		await test.step( 'When I click on Login with Apple button', async function () {
			await loginPage.clickLoginWithApple();
			await page.waitForURL( /.*appleid\.apple\.com\/auth.*/ );
		} );

		await test.step( 'And I enter my Apple ID', async function () {
			appleLoginPage = new AppleLoginPage( page );
			await appleLoginPage.enterEmail( credentials.email as string );
			await appleLoginPage.pressEnter();
		} );

		await test.step( 'And I enter my Apple password', async function () {
			await appleLoginPage.enterPassword( credentials.password );
			await appleLoginPage.pressEnter();
			timestamp = new Date( Date.now() );
		} );

		await test.step( 'And I handle the 2FA challenge if it appears', async function () {
			const url = page.url();

			// Handle potential 2FA challenge.
			if ( url.includes( 'appleid.apple.com/auth/authorize' ) ) {
				const emailClient = new EmailClient();
				const message = await emailClient.getLastMatchingMessage( {
					inboxId: SecretsManager.secrets.mailosaur.totpUserInboxId,
					receivedAfter: timestamp,
					subject: 'SMS',
					body: 'Your Apple Account code is',
				} );

				const code = emailClient.get2FACodeFromMessage( message );

				await appleLoginPage.enter2FACode( code );
				await appleLoginPage.clickButtonWithExactText( 'Trust' );
			}
		} );

		await test.step( 'And I confirm login with Apple ID', async function () {
			await appleLoginPage.clickButtonContainingText( 'Continue' );
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
