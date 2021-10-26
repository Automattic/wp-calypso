import {
	DataHelper,
	EmailClient,
	LoginFlow,
	SidebarComponent,
	InvitePeoplePage,
	PeoplePage,
	setupHooks,
	UserSignupPage,
	Roles,
	BrowserManager,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe.skip( DataHelper.createSuiteTitle( `Invite: New User` ), function () {
	const inboxId = DataHelper.config.get( 'inviteInboxId' ) as string;
	const role = 'Editor';
	const username = `e2eflowtestingeditor${ DataHelper.getTimestamp() }`;
	const email = DataHelper.getTestEmailAddress( {
		inboxId: inboxId,
		prefix: username,
	} );
	const signupPassword = DataHelper.config.get( 'passwordForNewTestSignUps' ) as string;
	const invitingUser = 'privateSiteUser';

	let adjustedInviteLink: string;
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( 'Invite user', function () {
		let peoplePage: PeoplePage;
		let sidebarComponent: SidebarComponent;

		it( 'Log in as inviting user', async function () {
			const loginFlow = new LoginFlow( page, invitingUser );
			await loginFlow.logIn();
		} );

		it( 'Navigate to Users > All Users', async function () {
			sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Users', 'All Users' );
		} );

		it( `Create new invite`, async function () {
			peoplePage = new PeoplePage( page );
			await peoplePage.clickInviteUser();

			const invitePeoplePage = new InvitePeoplePage( page );
			await invitePeoplePage.invite( {
				email: email,
				role: role as Roles,
				message: `Test invite for role of ${ role }`,
			} );
		} );

		it( 'Confirm invite is pending', async function () {
			await sidebarComponent.navigate( 'Users', 'All Users' );
			await peoplePage.clickTab( 'Invites' );
			await peoplePage.selectInvitedUser( email );
		} );
	} );

	describe( 'Accept invite', function () {
		it( 'Clear authenticated state', async function () {
			await BrowserManager.clearAuthenticationState( page );
		} );

		it( `Invite email was received for test user`, async function () {
			const emailClient = new EmailClient();
			const message = await emailClient.getLastEmail( {
				inboxId: inboxId,
				emailAddress: email,
			} );
			const links = await emailClient.getLinksFromMessage( message );
			const acceptInviteLink = links.find( ( link: string ) =>
				link.includes( 'accept-invite' )
			) as string;
			expect( acceptInviteLink ).toBeDefined();
			adjustedInviteLink = DataHelper.adjustInviteLink( acceptInviteLink );
		} );

		it( 'Sign up as invited user from the invite link', async function () {
			await page.goto( adjustedInviteLink );

			const userSignupPage = new UserSignupPage( page );
			await userSignupPage.signup( email, username, signupPassword );
		} );

		it( 'User sees welcome banner after signup', async function () {
			// Raw method call & selector used because PostsPage is not yet implemented.
			// TODO: Once PostsPage is implemented, call a method from that
			// POM instead.
			const bannerText = "You're now an Editor of: e2eflowtestingprivate";
			await page.waitForSelector( `:text("${ bannerText }")` );
		} );
	} );

	describe( 'Remove invited user', function () {
		let peoplePage: PeoplePage;
		let sidebarComponent: SidebarComponent;

		it( 'Clear authenticated state', async function () {
			await BrowserManager.clearAuthenticationState( page );
		} );

		it( 'Log in as inviting user', async function () {
			const loginFlow = new LoginFlow( page, invitingUser );
			await loginFlow.logIn();
		} );

		it( 'Navigate to Users > All Users', async function () {
			sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Users', 'All Users' );
		} );

		it( 'View invited user in Team', async function () {
			peoplePage = new PeoplePage( page );
			await peoplePage.selectUser( username );
		} );

		it( 'Remove invited user from site', async function () {
			await peoplePage.deleteUser();
		} );
	} );
} );
