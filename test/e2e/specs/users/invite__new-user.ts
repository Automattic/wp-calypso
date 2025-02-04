/**
 * @group quarantined
 */

import {
	DataHelper,
	EmailClient,
	SidebarComponent,
	AddPeoplePage,
	InvitePeoplePage,
	PeoplePage,
	LoginPage,
	UserSignupPage,
	RoleValue,
	CloseAccountFlow,
	TestAccount,
	Roles,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( `Invite: New User` ), function () {
	const role = 'Editor';
	const invitingUser = 'calypsoPreReleaseUser';
	const testUser = DataHelper.getNewTestUser( {
		usernamePrefix: 'invited',
	} );

	let userManagementRevampFeature = false;
	let acceptInviteLink: string;
	let page: Page;

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
				`configData.features['user-management-revamp']`
			);
		} );

		it( 'Navigate to Users > All Users', async function () {
			sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Users', 'All Users' );
		} );

		it( `Create new invite`, async function () {
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
		it( `Invite email was received for test user`, async function () {
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
			await page.goto( acceptInviteLink );

			const userSignupPage = new UserSignupPage( page );
			await userSignupPage.signup( testUser.email, testUser.username, testUser.password );
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
			await peoplePage.deleteUser();
		} );
	} );

	describe( 'Close account', function () {
		it( 'Log in as invited user', async function () {
			const loginPage = new LoginPage( page );
			await loginPage.visit();
			await Promise.all( [
				page.waitForNavigation( { url: '**/reader' } ),
				loginPage.logInWithCredentials( testUser.email, testUser.password ),
			] );
		} );

		it( 'Close account', async function () {
			const closeAccountFlow = new CloseAccountFlow( page );
			await closeAccountFlow.closeAccount();
		} );
	} );
} );
