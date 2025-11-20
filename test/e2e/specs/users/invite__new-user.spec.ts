import {
	DataHelper,
	CloseAccountFlow,
	RoleValue,
	Roles,
	UserSignupPage,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe( 'Invite: New User', { tag: [ tags.CALYPSO_PR ] }, () => {
	const role = 'Editor';
	const testUser = DataHelper.getNewTestUser( {
		usernamePrefix: 'invited',
	} );

	let userManagementRevampFeature = false;
	let acceptInviteLink: string;

	test( 'As a WordPress.com user, I can invite a new user to my site, they can accept the invite and sign up, then I can remove them', async ( {
		page,
		componentSidebar,
		clientEmail,
		pageIncognito,
		pagePeople,
		pageAddPeople,
		pageInvitePeople,
		accountPreRelease,
	} ) => {
		await test.step( 'Given I am logged in as a site owner', async function () {
			await accountPreRelease.authenticate( page );

			userManagementRevampFeature = await page.evaluate(
				"configData.features['user-management-revamp']"
			);
		} );

		await test.step( 'When I navigate to Users > All Users', async function () {
			await componentSidebar.navigate( 'Users', 'All Users' );
		} );

		await test.step( `And I invite a new user with role ${ role }`, async function () {
			if ( userManagementRevampFeature ) {
				await pagePeople.clickAddTeamMember();
				await pageAddPeople.addTeamMember( {
					email: testUser.email,
					role: role.toLowerCase() as RoleValue,
					message: `Test invite for role of ${ role }`,
				} );
			} else {
				await pagePeople.clickInviteUser();
				await pageInvitePeople.invite( {
					email: testUser.email,
					role: role as Roles,
					message: `Test invite for role of ${ role }`,
				} );
			}
		} );

		await test.step( 'Then I can see the invite is pending', async function () {
			await componentSidebar.navigate( 'Users', 'All Users' );
			! userManagementRevampFeature && ( await pagePeople.clickTab( 'Invites' ) );
			await pagePeople.selectInvitedUser( testUser.email );
		} );

		await test.step( 'When the invited user checks their email', async function () {
			const message = await clientEmail.getLastMatchingMessage( {
				inboxId: testUser.inboxId,
				sentTo: testUser.email,
			} );
			const links = await clientEmail.getLinksFromMessage( message );
			acceptInviteLink = links.find( ( link: string ) =>
				link.includes( 'accept-invite' )
			) as string;
			expect( acceptInviteLink ).toBeDefined();
		} );

		await test.step( 'And they sign up from the invite link', async function () {
			await pageIncognito.goto( acceptInviteLink );

			const userSignupPage = new UserSignupPage( pageIncognito.getPage() );
			await userSignupPage.signupThroughInvite( testUser.email );
		} );

		await test.step( 'Then they see a welcome banner after signup', async function () {
			const bannerText = `You're now an ${ role } of: `;
			await pageIncognito.getPage().waitForSelector( `:has-text("${ bannerText }")` );
		} );

		await test.step( 'When I navigate back to Users > All Users', async function () {
			await componentSidebar.navigate( 'Users', 'All Users' );
		} );

		await test.step( 'Then I can see the invited user in the team', async function () {
			await pagePeople.selectUser( testUser.username );
		} );

		await test.step( 'When I remove the invited user from the site', async function () {
			await pagePeople.deleteUser( testUser.username );
		} );

		await test.step( 'And the invited user closes their account', async function () {
			const closeAccountFlow = new CloseAccountFlow( pageIncognito.getPage() );
			await closeAccountFlow.closeAccount();
		} );
	} );
} );
