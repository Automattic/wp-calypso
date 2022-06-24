/**
 * @group calypso-release
 */

import { DataHelper, EmailClient, LoginPage, SecretsManager } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import type { Message } from 'mailosaur/lib/models';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Authentication: Magic Link' ), function () {
	let page: Page;
	let loginPage: LoginPage;
	let emailClient: EmailClient;
	let magicLinkURL: string;
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
		const credentials = SecretsManager.secrets.testAccounts.defaultUser;

		await loginPage.fillUsername( credentials.email );
		await loginPage.clickSubmit();

		emailClient = new EmailClient();
		magicLinkEmail = await emailClient.getLastEmail( {
			inboxId: SecretsManager.secrets.mailosaur.defaultUserInboxId,
			emailAddress: credentials.email,
			subject: 'Log in to WordPress.com',
		} );
		const links = await emailClient.getLinksFromMessage( magicLinkEmail );
		magicLinkURL = links.find( ( link: string ) => link.includes( 'wpcom_email_click' ) );

		expect( magicLinkURL ).toBeDefined();
	} );

	it( 'Go to the Magic Link URL', async function () {
		await page.goto( new URL( magicLinkURL ).toString() );
	} );

	it( 'Click the "Continue to WordPress.com" button', async () => {
		// Page object for this screen is not implemented, and because it's a
		// single-purpose screen, there really is no need to.
		await Promise.all( [
			page.waitForNavigation( { url: /\/home\// } ),
			page.click( 'text=Continue to WordPress.com' ),
		] );
	} );

	afterAll( async () => {
		if ( magicLinkEmail ) {
			await emailClient.deleteMessage( magicLinkEmail );
		}
	} );
} );
