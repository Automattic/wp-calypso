import { DataHelper, RestAPIClient, SecretsManager } from '@automattic/calypso-e2e';
import { expect, skipIfMailosaurLimitReached, tags, test } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'Invite: Revoke' ),
	{ tag: [ tags.CALYPSO_PR, tags.CALYPSO_RELEASE, tags.DESKTOP_ONLY ] },
	() => {
		skipIfMailosaurLimitReached();
		const testUser = DataHelper.getNewTestUser( {
			useMailosaur: true,
			usernamePrefix: 'e2eflowtestinginvite',
		} );
		const inboxId = testUser.inboxId;
		const testEmailAddress = testUser.email;
		const role = 'Editor';
		const inviteMessage = `Test invite for role of ${ role }`;
		const credentials = SecretsManager.secrets.testAccounts.defaultUser;

		let acceptInviteLink: string;
		let userManagementRevampFeature = false;

		const siteID = credentials.testSites?.primary?.id as number;

		// Emails this suite has actually invited. The revoke happens through the UI
		// at the end of the test, so a run that dies before that step leaks its
		// pending invite. Only invites tracked here are deleted in teardown, so a
		// concurrent run's in-flight invites are never touched.
		const createdInviteEmails: string[] = [];

		test.beforeAll( async function () {
			// Diagnostic only, no mutation. The People page caps the pending-invites
			// list it renders, so a saturated site can hide a freshly created invite
			// and fail waitForInvitation. Log how many pending invites (from any run)
			// exist at start. The list endpoint returns at most 100 per page, so this
			// is a floor, not an exact count.
			// Never let a diagnostic read fail the suite: swallow and log.
			try {
				const restAPIClient = new RestAPIClient( credentials );
				const firstPage = await restAPIClient.getInvites( siteID, 100 );
				const pending = firstPage.filter( ( invite ) => invite.is_pending ).length;
				process.stderr.write(
					`[invite__revoke] pending invites on site ${ siteID } at start: ${ pending }${
						firstPage.length >= 100 ? '+ (list truncated at 100)' : ''
					}\n`
				);
			} catch ( error ) {
				process.stderr.write( `[invite__revoke] start diagnostic failed: ${ error }\n` );
			}
		} );

		test.afterAll( async function () {
			if ( ! createdInviteEmails.length ) {
				return;
			}
			// Best-effort cleanup: a failure here must not fail an otherwise-passing
			// run, so swallow errors and log them instead.
			try {
				const restAPIClient = new RestAPIClient( credentials );
				// Scans only the first page (100). Enough while every run cleans up
				// after itself; if the site holds >100 pending invites and the endpoint
				// is not newest-first, follow the response's pagination links instead.
				const staleKeys = ( await restAPIClient.getInvites( siteID, 100 ) )
					.filter(
						( invite ) => invite.is_pending && createdInviteEmails.includes( invite.user.email )
					)
					.map( ( invite ) => invite.invite_key );

				if ( staleKeys.length ) {
					const { invalid } = await restAPIClient.deleteInvites( siteID, staleKeys );
					if ( invalid.length ) {
						process.stderr.write(
							`[invite__revoke] teardown could not delete ${
								invalid.length
							} invite(s): ${ invalid.join( ', ' ) }\n`
						);
					}
				}
			} catch ( error ) {
				process.stderr.write( `[invite__revoke] teardown failed: ${ error }\n` );
			}
		} );

		test( 'As a site owner, I can revoke a pending invite so that the invitation link becomes invalid', async ( {
			page,
			componentSidebar,
			clientEmail,
			pageIncognito,
			pagePeople,
			accountDefaultUser,
		} ) => {
			await test.step( 'Given I create an invite via REST API', async function () {
				const restAPIClient = new RestAPIClient( credentials );

				// Track before the call: createInvite can create the invite server-side
				// and still throw (e.g. while parsing the response), so the email must be
				// queued for teardown before the request, not after.
				createdInviteEmails.push( testEmailAddress );
				await restAPIClient.createInvite( siteID, {
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
				if ( ! userManagementRevampFeature ) {
					await pagePeople.clickTab( 'Invites' );
				}
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
