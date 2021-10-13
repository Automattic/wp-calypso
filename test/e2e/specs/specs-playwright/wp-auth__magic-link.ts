/**
 * @group calypso-release
 */

import { setupHooks, DataHelper, EmailClient, LoginPage } from '@automattic/calypso-e2e';
import { Page } from 'playwright';
import type { Message } from 'mailosaur/lib/models';

describe( DataHelper.createSuiteTitle( 'Authentication: Magic Link' ), function () {
	const inboxId = DataHelper.config.get( 'defaultUserInboxId' ) as string;
	// This method of obtaining the email address of the test user is temporary.
	// The encrypted configuration file needs a revamp and have the format standardized
	// and when that is copmlete, this can be replaced with an appropriate query method
	// to extract the email address of the test user.
	// See https://github.com/Automattic/wp-calypso/issues/55694.
	const email = `main.${ inboxId }@mailosaur.io`;
	let magicLink: string;
	let loginPage: LoginPage;
	let page: Page;
	let message: Message;
	let emailClient: EmailClient;

	setupHooks( ( args: { page: Page } ) => {
		page = args.page;
	} );

	it( 'Navigate to Login page', async function () {
		loginPage = new LoginPage( page );
		await loginPage.visit();
	} );

	it( 'Request magic link', async function () {
		await loginPage.requestMagicLink( email );
	} );

	it( 'Magic link is received', async function () {
		emailClient = new EmailClient();
		message = await emailClient.getLastEmail( {
			inboxId: inboxId,
			emailAddress: email,
			subject: 'Log in to WordPress.com',
		} );
		const links = await emailClient.getLinksFromMessage( message );
		magicLink = links.find( ( link: string ) => link.includes( 'wpcom_email_click' ) ) as string;
		expect( magicLink ).toBeDefined();
	} );

	it( 'Log in using magic link', async function () {
		const loginPage = new LoginPage( page );
		await loginPage.followMagicLink( magicLink );
	} );

	afterAll( async function () {
		if ( message ) {
			await emailClient.deleteMessage( message );
		}
	} );
} );
