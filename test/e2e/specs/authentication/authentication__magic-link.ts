/**
 * @group authentication
 */

import { DataHelper, EmailClient, LoginPage, SecretsManager } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import type { Message } from 'mailosaur/lib/models';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Authentication: Magic Link' ), function () {
	const credentials = SecretsManager.secrets.testAccounts.defaultUser;
	let page: Page;
	let loginPage: LoginPage;
	let emailClient: EmailClient;
	let magicLinkURL: URL;
	let magicLinkEmail: Message;

	beforeAll( async () => {
		page = await browser.newPage();
	} );

	it( 'Navigate to Magic Link screen from /login', async function () {
		loginPage = new LoginPage( page );
		await loginPage.visit();
		await loginPage.clickSendMagicLink();
	} );

	it( 'Request magic link', async function () {
		// It is safe to add type assertion here, since the email
		// field is defined for `defaultUser`.
		await loginPage.fillUsername( credentials.email as string );
		await loginPage.clickSubmit();

		emailClient = new EmailClient();
		magicLinkEmail = await emailClient.getLastMatchingMessage( {
			inboxId: SecretsManager.secrets.mailosaur.defaultUserInboxId,
			sentTo: credentials.email as string,
			subject: 'Log in to WordPress.com',
		} );
		magicLinkURL = emailClient.getMagicLink( magicLinkEmail );

		expect( magicLinkURL.href ).toBeDefined();
	} );

	it( 'Open the magic link', async function () {
		await page.goto( magicLinkURL.href );
	} );

	it( 'Redirected to Home dashboard', async function () {
		await page.waitForURL( /home/, { timeout: 15 * 1000 } );
	} );

	afterAll( async () => {
		if ( magicLinkEmail ) {
			await emailClient.deleteMessage( magicLinkEmail );
		}
	} );
} );
