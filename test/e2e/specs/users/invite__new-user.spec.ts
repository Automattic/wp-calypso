import {
	DataHelper,
	CloseAccountFlow,
	RestAPIClient,
	RoleValue,
	Roles,
	UserSignupPage,
} from '@automattic/calypso-e2e';
import { expect, skipIfMailosaurLimitReached, tags, test } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';
import type { NewUserResponse } from '@automattic/calypso-e2e';

test.describe( 'Invite: New User', { tag: [ tags.CALYPSO_PR ] }, () => {
	skipIfMailosaurLimitReached();
	const role = 'Editor';
	const testUser = DataHelper.getNewTestUser( {
		useMailosaur: true,
		usernamePrefix: 'invited',
	} );

	let userManagementRevampFeature = false;
	let acceptInviteLink: string;

	// Accounts created during the run, closed via API in afterAll as a guaranteed
	// teardown. The in-body UI close below stays as product coverage; the API close
	// is the safety net for any run where the UI close did not happen. If the UI
	// close did run, this account's token is dead and apiCloseAccount is a safe
	// no-op (its existence probe writes no leak marker).
	const accountsToCleanup: {
		user: NewUserResponse[ 'body' ];
		password: string;
		email: string;
	}[] = [];

	test( 'As a WordPress.com user, I can invite a new user to my site, they can accept the invite and sign up, then I can remove them', async ( {
		page,
		componentSidebar,
		clientEmail,
		pageIncognito,
		pagePeople,
		pageAddPeople,
		pageInvitePeople,
		accountPreRelease,
		helperData,
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

		await test.step( 'When I navigate to Users > All Users', async function () {
			await componentSidebar.navigate( 'Users', 'All Users' );
			if ( ! userManagementRevampFeature ) {
				await pagePeople.clickTab( 'Invites' );
			}
			await pagePeople.clickViewAllIfAvailable();
		} );

		await test.step( 'Then I can see the invite is pending', async function () {
			await pagePeople.waitForInvitation( testUser.email );
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

		let signedUpUsername: string;

		await test.step( 'And they sign up from the invite link', async function () {
			await pageIncognito.goto( acceptInviteLink );

			const userSignupPage = new UserSignupPage( pageIncognito.getPage() );
			const signUpResponse = await userSignupPage.signupThroughInvite( testUser.email );

			const created = signUpResponse.body;
			// Runtime guards: the signup response is untyped JSON, so the declared
			// type is not a wire guarantee. Assert the full identity the afterAll
			// teardown consumes, not just the username.
			expect( created?.user_id ).toBeDefined();
			expect( created?.bearer_token ).toBeDefined();
			accountsToCleanup.push( {
				user: created,
				password: testUser.password,
				email: testUser.email,
			} );

			signedUpUsername = created.username;
			expect( signedUpUsername ).toBeDefined();
		} );

		await test.step( 'Then they see a welcome banner after signup', async function () {
			await expect(
				pageIncognito.getPage().getByText( `You're now an ${ role } of: ` )
			).toBeVisible();
		} );

		await test.step( 'When I navigate back to Users > All Users', async function () {
			await componentSidebar.navigate( 'Users', 'All Users' );
		} );

		await test.step( 'Then I can see the invited user part of the team', async function () {
			// Use direct navigation to avoid finding the user when there are over 100 team members piled up.
			await pagePeople.visitTeamMemberUserDetails(
				helperData.getCalypsoURL(),
				accountPreRelease.credentials.testSites?.primary?.url as string,
				signedUpUsername
			);
		} );

		await test.step( 'Then I can remove the team member from the site', async function () {
			await pagePeople.removeUserFromSite( signedUpUsername );
		} );

		await test.step( 'And the invited user closes their account', async function () {
			const closeAccountFlow = new CloseAccountFlow( pageIncognito.getPage() );
			await closeAccountFlow.closeAccount();
		} );
	} );

	test.afterAll( async function () {
		for ( const acct of accountsToCleanup ) {
			if ( ! acct.user?.bearer_token ) {
				continue;
			}
			const restAPIClient = new RestAPIClient(
				{ username: acct.user.username, password: acct.password },
				acct.user.bearer_token
			);
			await apiCloseAccount( restAPIClient, {
				userID: acct.user.user_id,
				username: acct.user.username,
				email: acct.email,
			} );
		}
	} );
} );
