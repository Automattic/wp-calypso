/**
 * @group calypso-pr
 */

import {
	DataHelper,
	EmailClient,
	SidebarComponent,
	AddPeoplePage,
	InvitePeoplePage,
	PeoplePage,
	UserSignupPage,
	RoleValue,
	CloseAccountFlow,
	TestAccount,
	Roles,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Invite: New User' ), function () {
	const role = 'Editor';
	const invitingUser = 'calypsoPreReleaseUser';
	const testUser = DataHelper.getNewTestUser( {
		usernamePrefix: 'invited',
	} );

	let userManagementRevampFeature = false;
	let acceptInviteLink: string;
	let page: Page;
	let invitePage: Page;

	beforeAll( async () => {
		page = await browser.newPage();
	} );

	describe( 'Invite user', function () {
		let peoplePage: PeoplePage;
		let sidebarComponent: SidebarComponent;

		beforeAll( async () => {
			const testAccount = new TestAccount( invitingUser );
			await testAccount.authenticate( page );

			userManagementRevampFeature = await page.evaluate(
				"configData.features['user-management-revamp']"
			);
		} );

		it( 'Navigate to Users > All Users', async function () {
			sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Users', 'All Users' );
		} );

		it( 'Create new invite', async function () {
			peoplePage = new PeoplePage( page );
			if ( userManagementRevampFeature ) {
				await peoplePage.clickAddTeamMember();
				const addPeoplePage = new AddPeoplePage( page );

				await addPeoplePage.addTeamMember( {
					email: testUser.email,
					role: role.toLowerCase() as RoleValue,
					message: `Test invite for role of ${ role }`,
				} );
			} else {
				await peoplePage.clickInviteUser();
				const invitePeoplePage = new InvitePeoplePage( page );

				await invitePeoplePage.invite( {
					email: testUser.email,
					role: role as Roles,
					message: `Test invite for role of ${ role }`,
				} );
			}
		} );

		it( 'Confirm invite is pending', async function () {
			await sidebarComponent.navigate( 'Users', 'All Users' );
			! userManagementRevampFeature && ( await peoplePage.clickTab( 'Invites' ) );
			await peoplePage.selectInvitedUser( testUser.email );
		} );
	} );

	describe( 'Accept invite', function () {
		beforeAll( async () => {
			// Create a fresh context in the same browser for invite acceptance
			invitePage = await browser.newContext().then( ( context ) => context.newPage() );
		} );

		// Keep invitePage open as we'll need it for the close account flow

		it( 'Invite email was received for test user', async function () {
			const emailClient = new EmailClient();
			const message = await emailClient.getLastMatchingMessage( {
				inboxId: testUser.inboxId,
				sentTo: testUser.email,
			} );
			const links = await emailClient.getLinksFromMessage( message );
			acceptInviteLink = links.find( ( link: string ) =>
				link.includes( 'accept-invite' )
			) as string;
			expect( acceptInviteLink ).toBeDefined();
		} );

		it( 'Sign up as invited user from the invite link', async function () {
			await invitePage.goto( acceptInviteLink );

			const userSignupPage = new UserSignupPage( invitePage );
			await userSignupPage.signupThroughInvite( testUser.email );
		} );

		it( 'User sees welcome banner after signup', async function () {
			// Raw method call & selector used because `PostsPage` is not yet implemented.
			// TODO: Once PostsPage is implemented, call a method from that
			// POM instead.
			const bannerText = `You're now an ${ role } of: `;
			await invitePage.waitForSelector( `:has-text("${ bannerText }")` );
		} );
	} );

	describe( 'Remove invited user', function () {
		let peoplePage: PeoplePage;
		let sidebarComponent: SidebarComponent;

		beforeAll( async () => {
			const testAccount = new TestAccount( invitingUser );
			await testAccount.authenticate( page );
		} );

		it( 'Navigate to Users > All Users', async function () {
			sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Users', 'All Users' );
		} );

		it( 'View invited user in Team', async function () {
			peoplePage = new PeoplePage( page );
			await peoplePage.selectUser( testUser.username );
		} );

		it( 'Remove invited user from site', async function () {
			await peoplePage.deleteUser( testUser.username );
		} );
	} );

	describe( 'Close account', function () {
		it( 'Close account', async function () {
			// Use the existing authenticated session from invitePage
			const closeAccountFlow = new CloseAccountFlow( invitePage );
			await closeAccountFlow.closeAccount();
		} );

		afterAll( async () => {
			// Now we can close invitePage since we're done with all tests
			if ( invitePage ) {
				await invitePage.context().close();
			}
		} );
	} );
} );
