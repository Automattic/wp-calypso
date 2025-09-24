import { DataHelper, GoogleLoginPage, TOTPClient } from '@automattic/calypso-e2e';
import { Page } from 'playwright';
import { expect, tags, test } from '../../lib/pw-base';

test.describe( 'Authentication: Google', { tag: [ tags.AUTHENTICATION ] }, () => {
	test.skip(
		DataHelper.isCalypsoProduction() === false,
		'Skipping unless running on WordPress.com as Google authentication requires prod callbacks'
	);

	test( 'As a WordPress.com user, I can use my Google account to authenticate ', async ( {
		page,
		pageLogin,
		secrets,
	}, workerInfo ) => {
		test.skip(
			workerInfo.project.name !== 'authentication',
			'The authentication project is the only one that has the right browser settings for authentication tests'
		);
		const totpClient = new TOTPClient( secrets.testAccounts.googleLoginUser.totpKey as string );

		let googlePopupPage: Page;
		let googleLoginPage: GoogleLoginPage;

		await test.step( 'Given I am on the login page', async function () {
			await pageLogin.visit();
		} );

		await test.step( 'When I click on Login with Google button', async function () {
			googlePopupPage = await pageLogin.clickLoginWithGoogle();
			await googlePopupPage.waitForURL( /accounts\.google\.com/ );
			await googlePopupPage.waitForURL( /identifier/ );
		} );

		await test.step( ' And I enter my Google username', async function () {
			googleLoginPage = new GoogleLoginPage( googlePopupPage );

			await googleLoginPage.enterUsername( secrets.testAccounts.googleLoginUser.username );
			await googleLoginPage.clickButton( 'Next' );
		} );

		await test.step( 'And I enter my Google password', async function () {
			await googleLoginPage.enterPassword( secrets.testAccounts.googleLoginUser.password );
			await googleLoginPage.clickButton( 'Next' );
		} );

		await test.step( 'And I handle 2FA two-factor authentication if needed', async function () {
			const code = totpClient.getToken();

			await googleLoginPage.enter2FACode( code );
			await googleLoginPage.clickButton( 'Next' );
		} );

		await test.step( 'Click the "Continue" button in the login confirmation screen', async function () {
			const googlePopupPageClosePromise = googlePopupPage.waitForEvent( 'close' );
			// The next screen has a prompt that asks the user to confirm the login by clicking 'Continue'.
			await googleLoginPage.clickButton( 'Continue' );
			// The popup should close after clicking the button,
			// if it does not, something has gone wrong.
			await googlePopupPageClosePromise;
		} );

		await test.step( 'Then I can see My Home on WordPress.com', async function () {
			await page.waitForURL( /.*\/home\/.*/ );
			await expect( page.getByRole( 'heading', { name: 'My Home' } ) ).toBeVisible();
		} );
	} );
} );
