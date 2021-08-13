import {
	DataHelper,
	BrowserManager,
	MediaHelper,
	EmailClient,
	LoginFlow,
	SidebarComponent,
	InvitePeoplePage,
	PeoplePage,
	setupHooks,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( `Invite: Revoke` ), function () {
	const newUsername = `e2eflowtestingviewer${ MediaHelper.createTimestamp() }`;
	const inboxId = DataHelper.config.get( 'inviteInboxId' ) as string;
	const testEmailAddress = DataHelper.getTestEmailAddress( {
		inboxId: inboxId,
		prefix: newUsername,
	} );
	const role = 'Editor';

	let adjustedInviteLink: string;
	let sidebarComponent: SidebarComponent;
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it( 'Can log in', async function () {
		const loginFlow = new LoginFlow( page );
		await loginFlow.logIn();
	} );

	it( 'Navigate to Users > All Users', async function () {
		sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.gotoMenu( { item: 'Users', subitem: 'Add New' } );
	} );

	it( `Invite user ${ newUsername }`, async function () {
		const invitePeoplePage = new InvitePeoplePage( page );
		await invitePeoplePage.invite( {
			email: testEmailAddress,
			role: role,
			message: `Test invite for role of ${ role }`,
		} );
	} );

	it( 'Revoke the invite', async function () {
		await sidebarComponent.gotoMenu( { item: 'Users', subitem: 'All users' } );
		const peoplePage = new PeoplePage( page );
		await peoplePage.clickTab( 'Invites' );
		await peoplePage.revokeInvite( testEmailAddress );
	} );

	it( `Invite email was received for user ${ newUsername }`, async function () {
		const emailClient = new EmailClient();
		const message = await emailClient.getLastEmail( {
			inboxId: inboxId,
			emailAddress: testEmailAddress,
		} );
		const links = await emailClient.getLinksFromMessage( message );

		const acceptInviteLink = links.find( ( link ) => link.href?.includes( 'accept-invite' ) );

		expect( acceptInviteLink!.href ).toBeDefined();

		adjustedInviteLink = DataHelper.adjustInviteLink( acceptInviteLink!.href! );
	} );

	it( `View invite link`, async function () {
		await BrowserManager.clearAuthenticationState( page );
		await page.goto( adjustedInviteLink );

		await page.waitForSelector( `:text("Oops, that invite is not valid")` );
	} );
} );
