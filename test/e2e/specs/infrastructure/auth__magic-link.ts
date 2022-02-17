/**
 * @group calypso-release
 */

import { DataHelper, EmailClient, LoginPage } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import type { Message } from 'mailosaur/lib/models';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Authentication: Magic Link' ), function () {
	// This method of obtaining the userEmail address of the test user is temporary.
	// The encrypted configuration file needs a revamp and have the format standardized
	// and when that is copmlete, this can be replaced with an appropriate query method
	// to extract the userEmail address of the test user.
	// See https://github.com/Automattic/wp-calypso/issues/55694.
	const emailInboxId = DataHelper.config.get( 'defaultUserInboxId' ) as string;
	const userEmail = `main.${ emailInboxId }@mailosaur.io`;

	let page: Page;
	let loginPage: LoginPage;
	let emailClient: EmailClient;
	let magicLinkURL: string;
	let magicLinkEmail: Message;

	beforeAll( async () => {
		page = await browser.newPage();
	} );

	it( 'Navigate to Login page', async function () {
		loginPage = new LoginPage( page );
		await loginPage.visit();
	} );

	it( 'Request magic link', async function () {
		await loginPage.clickSendMagicLink();
		await loginPage.fillUsername( userEmail );
		await loginPage.clickSubmit();

		emailClient = new EmailClient();
		magicLinkEmail = await emailClient.getLastEmail( {
			inboxId: emailInboxId,
			emailAddress: userEmail,
			subject: 'Log in to WordPress.com',
		} );
		const links = await emailClient.getLinksFromMessage( magicLinkEmail );
		magicLinkURL = links.find( ( link ) => link.includes( 'wpcom_email_click' ) ) as string;

		expect( magicLinkURL ).toBeDefined();
	} );

	it( 'Go to the Magic Link URL', async function () {
		await page.goto( new URL( magicLinkURL ).toString() );
	} );

	it( 'Click the "Continue to WordPress.com" button', async () => {
		await page.click( 'text=Continue to WordPress.com' );
	} );

	it( 'Ensure user is logged in', async () => {
		await page.waitForSelector( 'text="My Home"' );
	} );

	afterAll( async () => {
		if ( magicLinkEmail ) {
			await emailClient.deleteMessage( magicLinkEmail );
		}
	} );
} );
