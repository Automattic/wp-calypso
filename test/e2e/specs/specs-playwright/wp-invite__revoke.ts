/**
 * @group calypso-pr
 */

import {
	DataHelper,
	EmailClient,
	LoginPage,
	SidebarComponent,
	InvitePeoplePage,
	PeoplePage,
	BrowserManager,
	setupHooks,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( `Invite: Revoke` ), function () {
	const newUsername = `e2eflowtestingviewer${ DataHelper.getTimestamp() }`;
	const inboxId = DataHelper.config.get( 'inviteInboxId' ) as string;
	const testEmailAddress = DataHelper.getTestEmailAddress( {
		inboxId: inboxId,
		prefix: newUsername,
	} );
	const role = 'Editor';

	let adjustedInviteLink: string;
	let sidebarComponent: SidebarComponent;
	let peoplePage: PeoplePage;
	let page: Page;

	setupHooks( ( args: { page: Page } ) => {
		page = args.page;
	} );

	it( 'Log in', async function () {
		const loginPage = new LoginPage( page );
		await loginPage.login( { account: 'defaultUser' } );
	} );

	it( 'Navigate to Users > All Users', async function () {
		sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.navigate( 'Users', 'All Users' );
	} );

	it( 'Invite test user to the site', async function () {
		peoplePage = new PeoplePage( page );
		await peoplePage.clickInviteUser();

		const invitePeoplePage = new InvitePeoplePage( page );
		await invitePeoplePage.invite( {
			email: testEmailAddress,
			role: role,
			message: `Test invite for role of ${ role }`,
		} );
	} );

	it( 'Invite email was received for test user', async function () {
		const emailClient = new EmailClient();
		const message = await emailClient.getLastEmail( {
			inboxId: inboxId,
			emailAddress: testEmailAddress,
		} );
		const links = await emailClient.getLinksFromMessage( message );
		const acceptInviteLink = links.find( ( link: string ) =>
			link.includes( 'accept-invite' )
		) as string;

		expect( acceptInviteLink ).toBeDefined();

		adjustedInviteLink = DataHelper.adjustInviteLink( acceptInviteLink );
	} );

	it( 'Revoke the invite for test user', async function () {
		await sidebarComponent.navigate( 'Users', 'All Users' );
		await peoplePage.clickTab( 'Invites' );
		await peoplePage.selectInvitedUser( testEmailAddress );
		await peoplePage.revokeInvite();
	} );

	it( `Ensure invite link is no longer valid`, async function () {
		const testPage = await BrowserManager.newPage( { newContext: true } );
		await testPage.goto( adjustedInviteLink );

		await testPage.waitForSelector( `:text("Oops, that invite is not valid")` );
	} );
} );
