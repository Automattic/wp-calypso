/**
 * @group calypso-release
 */

import {
	DataHelper,
	EmailClient,
	SidebarComponent,
	InvitePeoplePage,
	PeoplePage,
	LoginPage,
	UserSignupPage,
	Roles,
	BrowserManager,
	CloseAccountFlow,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';
import { setupHooks } from '../../lib/jest/setup-hooks';

describe( DataHelper.createSuiteTitle( `Invite: New User` ), function () {
	const inboxId = DataHelper.config.get( 'inviteInboxId' ) as string;
	const role = 'Editor';
	const username = `e2eflowtestingeditor${ DataHelper.getTimestamp() }`;
	const email = DataHelper.getTestEmailAddress( {
		inboxId: inboxId,
		prefix: username,
	} );
	const signupPassword = DataHelper.config.get( 'passwordForNewTestSignUps' ) as string;
	const invitingUser = 'calypsoPreReleaseUser';

	let adjustedInviteLink: string;
	let page: Page;

	setupHooks( ( createdPage ) => {
		page = createdPage;
	} );

	describe( 'Invite user', function () {
		let peoplePage: PeoplePage;
		let sidebarComponent: SidebarComponent;

		it( 'Log in', async function () {
			const loginPage = new LoginPage( page );
			await loginPage.login( { account: invitingUser } );
		} );

		it( 'Navigate to Users > All Users', async function () {
			sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Users', 'All Users' );
		} );

		it( `Create new invite`, async function () {
			peoplePage = new PeoplePage( page );
			await peoplePage.clickInviteUser();

			const invitePeoplePage = new InvitePeoplePage( page );
			console.log( email );
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
			// Raw method call & selector used because `PostsPage` is not yet implemented.
			// TODO: Once PostsPage is implemented, call a method from that
			// POM instead.
			const bannerText = `You're now an ${ role } of: `;
			await page.waitForSelector( `:has-text("${ bannerText }")` );
		} );
	} );

	describe( 'Remove invited user', function () {
		let peoplePage: PeoplePage;
		let sidebarComponent: SidebarComponent;

		it( 'Log in as inviting user', async function () {
			const loginPage = new LoginPage( page );
			await loginPage.login( { account: invitingUser } );
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

	describe( 'Close account', function () {
		it( 'Log in as invited user', async function () {
			const loginPage = new LoginPage( page );
			await loginPage.login(
				{ username: email, password: signupPassword },
				{ landingUrl: '**/read' }
			);
		} );

		it( 'Close account', async function () {
			const closeAccountFlow = new CloseAccountFlow( page );
			await closeAccountFlow.closeAccount();
		} );
	} );
} );
