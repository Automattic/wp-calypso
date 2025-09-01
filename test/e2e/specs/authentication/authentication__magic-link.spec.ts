import { Message } from 'mailosaur/lib/models';
import { test, expect } from '../../lib/pw_base';

test.describe( 'Authentication: Magic Link', () => {
	test( 'As a WordPress.com user, I can use a magic link to login to WordPress.com', async ( {
		clientEmail,
		page,
		pageLogin,
		secrets,
	} ) => {
		let magicLinkURL: URL;
		let magicLinkEmail: Message;

		await test.step( 'Given I am on the login page', async function () {
			await pageLogin.visit();
		} );

		await test.step( 'When I click on magic link', async function () {
			await pageLogin.clickSendMagicLink();
		} );

		await test.step( 'And I request a magic link', async function () {
			await pageLogin.fillUsername( secrets.testAccounts.defaultUser.email as string );
			await pageLogin.clickSubmit();

			magicLinkEmail = await clientEmail.getLastMatchingMessage( {
				inboxId: secrets.mailosaur.defaultUserInboxId,
				sentTo: secrets.testAccounts.defaultUser.email as string,
				subject: 'Log in to WordPress.com',
			} );
			magicLinkURL = clientEmail.getMagicLink( magicLinkEmail );

			expect( magicLinkURL.href ).toBeDefined();
		} );

		await test.step( 'And I visit the magic link', async function () {
			await page.goto( magicLinkURL.href );
		} );

		await test.step( 'Then I am redirected to the WordPress.com homepage', async function () {
			await page.waitForURL( /home/, { timeout: 15 * 1000 } );
		} );

		await test.step( 'And I can see My Home on WordPress.com', async function () {
			await expect( page.getByRole( 'heading', { name: 'My Home' } ) ).toBeVisible();
		} );

		await test.step( 'And I can delete the magic link email', async function () {
			if ( magicLinkEmail ) {
				await clientEmail.deleteMessage( magicLinkEmail );
			}
		} );
	} );
} );
