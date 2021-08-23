import {
	DataHelper,
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
	let peoplePage: PeoplePage;
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
		await sidebarComponent.navigate( 'Users', 'All Users' );
	} );

	it( `Create new invite for test user`, async function () {
		peoplePage = new PeoplePage( page );
		await peoplePage.clickInviteUser();

		const invitePeoplePage = new InvitePeoplePage( page );
		await invitePeoplePage.invite( {
			email: testEmailAddress,
			role: role,
			message: `Test invite for role of ${ role }`,
		} );
	} );

	it( 'Revoke the invite for test user', async function () {
		await sidebarComponent.navigate( 'Users', 'All Users' );
		await peoplePage.clickTab( 'Invites' );
		await peoplePage.revokeInvite( testEmailAddress );
	} );

	it( `Invite email was received for test user`, async function () {
		const emailClient = new EmailClient();
		const message = await emailClient.getLastEmail( {
			inboxId: inboxId,
			emailAddress: testEmailAddress,
		} );
		const links = await emailClient.getLinksFromMessage( message );
		const acceptInviteLink = links.find( ( link: string ) => link.includes( 'accept-invite' ) );

		adjustedInviteLink = await DataHelper.adjustInviteLink( acceptInviteLink );

		expect( acceptInviteLink ).toBeDefined();
	} );

	it( `Ensure invite link is no longer valid`, async function () {
		await page.goto( adjustedInviteLink );

		await page.waitForSelector( `:text("Oops, that invite is not valid")` );
	} );
} );
