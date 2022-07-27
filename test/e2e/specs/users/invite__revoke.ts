/**
 * @group calypso-release
 */

import {
	DataHelper,
	EmailClient,
	SidebarComponent,
	PeoplePage,
	TestAccount,
	SecretsManager,
	RestAPIClient,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( `Invite: Revoke` ), function () {
	const newUsername = `e2eflowtestinginvite${ DataHelper.getTimestamp() }`;
	const inboxId = SecretsManager.secrets.mailosaur.inviteInboxId;
	const testEmailAddress = DataHelper.getTestEmailAddress( {
		inboxId: inboxId,
		prefix: newUsername,
	} );
	const role = 'Editor';
	const inviteMessage = `Test invite for role of ${ role }`;
	const credentials = SecretsManager.secrets.testAccounts.defaultUser;

	let adjustedInviteLink: string;
	let peoplePage: PeoplePage;
	let page: Page;
	let restAPIClient: RestAPIClient;
	let revoked = false;

	describe( 'Setup', function () {
		beforeAll( async () => {
			restAPIClient = new RestAPIClient( credentials );

			await restAPIClient.createInvite( credentials.testSites?.primary?.id as number, {
				email: [ testEmailAddress ],
				role: role,
				message: inviteMessage,
			} );
		} );

		it( 'Invite email was received for test user', async function () {
			const emailClient = new EmailClient();
			const message = await emailClient.getLastMatchingMessage( {
				inboxId: inboxId,
				sentTo: testEmailAddress,
			} );
			const links = await emailClient.getLinksFromMessage( message );
			const acceptInviteLink = links.find( ( link: string ) =>
				link.includes( 'accept-invite' )
			) as string;

			expect( acceptInviteLink ).toBeDefined();

			adjustedInviteLink = DataHelper.adjustInviteLink( acceptInviteLink );
		} );
	} );

	describe( 'Revoke pending invite', function () {
		beforeAll( async function () {
			page = await browser.newPage();
			const testAccount = new TestAccount( 'defaultUser' );
			await testAccount.authenticate( page );
		} );

		it( 'Navigate to User > All Users', async function () {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Users', 'All Users' );
		} );

		it( 'View pending invites', async function () {
			peoplePage = new PeoplePage( page );
			await peoplePage.clickTab( 'Invites' );
		} );

		it( 'Revoke the invite for test user', async function () {
			await peoplePage.selectInvitedUser( testEmailAddress );
			await peoplePage.revokeInvite();
			revoked = true;
		} );

		it( `Ensure invite link is no longer valid`, async function () {
			const newPage = await browser.newPage();
			await newPage.goto( adjustedInviteLink );

			// Text selector will suffice for now.
			await newPage.waitForSelector( `:text("Oops, that invite is not valid")` );
		} );
	} );

	afterAll( async function () {
		if ( revoked ) {
			return;
		}

		const response = await restAPIClient.deleteInvite(
			credentials.testSites?.primary.id as number,
			testEmailAddress
		);

		if ( response ) {
			console.log( 'Successfully cleaned up after invite.' );
		} else {
			console.warn( `Failed to clean up test invite for user ${ testEmailAddress }` );
		}
	} );
} );
