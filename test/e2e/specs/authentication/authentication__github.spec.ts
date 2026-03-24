import { DataHelper } from '@automattic/calypso-e2e';
import { expect, skipIfMailosaurLimitReached, tags, test } from '../../lib/pw-base';

test.describe( 'Authentication: GitHub', { tag: [ tags.AUTHENTICATION ] }, () => {
	skipIfMailosaurLimitReached();
	test.skip(
		DataHelper.isCalypsoProduction() === false,
		'Skipping unless running on WordPress.com as GitHub authentication requires prod callbacks'
	);

	test( 'As a WordPress.com user, I can use my GitHub account to authenticate ', async ( {
		clientEmail,
		page,
		pageGitHubLogin,
		pageLogin,
		secrets,
	}, workerInfo ) => {
		// eslint-disable-next-line playwright/no-skipped-test
		test.skip( true, 'Skipping the tests because of captcha issues on GitHub login page' );
		test.skip(
			workerInfo.project.name !== 'authentication',
			'The authentication project is the only one that has the right browser settings for authentication tests'
		);

		let timestamp: Date;
		let code: string;

		await test.step( 'Given I am on the login page', async function () {
			await pageLogin.visit();
		} );

		await test.step( 'When I click on Login with GitHub button', async function () {
			await pageLogin.clickLoginWithGitHub();
			await page.waitForURL( /.*github\.com\/login.*/ );
		} );

		await test.step( ' And I enter my GitHub username', async function () {
			await pageGitHubLogin.enterEmail( secrets.testAccounts.gitHubLoginUser.username as string );
			await pageGitHubLogin.pressEnter();
		} );

		await test.step( 'And I enter my GitHub password', async function () {
			await pageGitHubLogin.enterPassword( secrets.testAccounts.gitHubLoginUser.password );
			await pageGitHubLogin.pressEnter();
		} );

		await test.step( 'And I press Send SMS', async function () {
			timestamp = new Date( Date.now() );
			await pageGitHubLogin.clickButtonContainingText( 'Send SMS' );
		} );

		await test.step( 'And I handle SMS two-factor authentication', async function () {
			const message = await clientEmail.getLastMatchingMessage( {
				inboxId: secrets.mailosaur.totpUserInboxId,
				receivedAfter: timestamp,
				subject: 'SMS',
				body: 'GitHub authentication code',
			} );

			code = clientEmail.get2FACodeFromMessage( message );

			await pageGitHubLogin.enter2FACode( code );
		} );

		await test.step( 'And I handle GitHub device verification if needed', async function () {
			// GitHub may show a device verification screen in CI
			const onVerificationPage = await page
				.waitForURL( '**/sessions/verified-device', { timeout: 5000 } )
				.then(
					() => true,
					() => false
				);
			if ( onVerificationPage ) {
				await pageGitHubLogin.clickButtonWithExactText( 'Verify' );
			}
		} );

		await test.step( 'And I skip GitHub trust device if needed', async function () {
			// GitHub may show a trusted device screen in CI
			const onTrustedDevicePage = await page
				.waitForURL( '**/sessions/trusted-device', { timeout: 5000 } )
				.then(
					() => true,
					() => false
				);
			if ( onTrustedDevicePage ) {
				await pageGitHubLogin.clickButtonWithExactText( "Don't ask again for this browser" );
			}
		} );

		await test.step( 'And I verify successful login to WordPress.com', async function () {
			await page.waitForURL( /.*wordpress\.com\/log-in\/github\/callback.*/ );
			await page.waitForURL( /.*wordpress\.com\/sites.*/ );

			expect( page.url() ).toMatch( /.*wordpress\.com\/sites.*/ );
		} );
	} );
} );
