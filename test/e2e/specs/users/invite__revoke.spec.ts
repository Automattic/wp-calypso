import { DataHelper, SecretsManager } from '@automattic/calypso-e2e';
import { expect, skipIfMailosaurLimitReached, tags, test } from '../../lib/pw-base';

test.describe(
	'Invite: Revoke',
	{ tag: [ tags.CALYPSO_PR, tags.CALYPSO_RELEASE, tags.DESKTOP_ONLY ] },
	() => {
		skipIfMailosaurLimitReached();
		const testUser = DataHelper.getNewTestUser( {
			usernamePrefix: 'e2eflowtestinginvite',
		} );
		const inboxId = testUser.inboxId;
		const testEmailAddress = testUser.email;
		const role = 'Editor';
		const inviteMessage = `Test invite for role of ${ role }`;
		const credentials = SecretsManager.secrets.testAccounts.defaultUser;

		let acceptInviteLink: string;
		let userManagementRevampFeature = false;

		test( 'As a site owner, I can revoke a pending invite so that the invitation link becomes invalid', async ( {
			page,
			componentSidebar,
			clientEmail,
			pageIncognito,
			pagePeople,
			accountDefaultUser,
		} ) => {
			await test.step( 'Given I create an invite via REST API', async function () {
				const { RestAPIClient } = await import( '@automattic/calypso-e2e' );
				const restAPIClient = new RestAPIClient( credentials );

				await restAPIClient.createInvite( credentials.testSites?.primary?.id as number, {
					email: [ testEmailAddress ],
					role: role,
					message: inviteMessage,
				} );
			} );

			await test.step( 'When the invite email is received', async function () {
				const message = await clientEmail.getLastMatchingMessage( {
					inboxId: inboxId,
					sentTo: testEmailAddress,
				} );
				const links = await clientEmail.getLinksFromMessage( message );
				acceptInviteLink = links.find( ( link: string ) =>
					link.includes( 'accept-invite' )
				) as string;
				expect( acceptInviteLink ).toBeDefined();
			} );

			await test.step( 'And I log in as the site owner', async function () {
				await accountDefaultUser.authenticate( page );

				userManagementRevampFeature = await page.evaluate(
					"configData.features['user-management-revamp']"
				);
			} );

			await test.step( 'When I navigate to Users > All Users', async function () {
				await componentSidebar.navigate( 'Users', 'All Users' );
				! userManagementRevampFeature && ( await pagePeople.clickTab( 'Invites' ) );
			} );

			await test.step( 'Then I can see the invite is pending', async function () {
				await pagePeople.waitForInvitation( testEmailAddress );
			} );

			await test.step( 'When I select the invited user', async function () {
				await pagePeople.selectInvitation( testEmailAddress );
			} );

			await test.step( 'And I revoke the invite', async function () {
				await pagePeople.revokeInvite();
			} );

			await test.step( 'Then the invite link is no longer valid', async function () {
				await pageIncognito.goto( acceptInviteLink );
				await expect(
					pageIncognito.getPage().getByText( 'That invite is not valid' )
				).toBeVisible();
			} );
		} );
	}
);
