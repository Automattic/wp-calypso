/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../../lib/flows/login-flow.js';

import AcceptInvitePage from '../../lib/pages/accept-invite-page.js';
import PostsPage from '../../lib/pages/posts-page.js';
import PeoplePage from '../../lib/pages/people-page.js';
import RevokePage from '../../lib/pages/revoke-page.js';
import InvitePeoplePage from '../../lib/pages/invite-people-page.js';
import EditTeamMemberPage from '../../lib/pages/edit-team-member-page.js';
import LoginPage from '../../lib/pages/login-page.js';
import ReaderPage from '../../lib/pages/reader-page.js';

import NoticesComponent from '../../lib/components/notices-component.js';
import NavBarComponent from '../../lib/components/nav-bar-component.js';
import NoSitesComponent from '../../lib/components/no-sites-component.js';

import * as dataHelper from '../../lib/data-helper.js';
import * as driverManager from '../../lib/driver-manager.js';
import EmailClient from '../../lib/email-client.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const inviteInboxId = config.get( 'inviteInboxId' );
const password = config.get( 'passwordForNewTestSignUps' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const emailClient = new EmailClient( inviteInboxId );

describe( `[${ host }] Invites - New user as Editor: (${ screenSize }) @parallel @jetpack`, function () {
	this.timeout( mochaTimeOut );
	const newUserName = 'e2eflowtestingeditora' + new Date().getTime().toString();
	const newInviteEmailAddress = dataHelper.getEmailAddress( newUserName, inviteInboxId );
	let acceptInviteURL = '';
	let inviteCreated = false;
	let inviteAccepted = false;

	it( 'Can log in and navigate to Invite People page', async function () {
		await new LoginFlow( this.driver ).loginAndSelectPeople();
		const peoplePage = await PeoplePage.Expect( this.driver );
		return await peoplePage.inviteUser();
	} );

	it( 'Can invite a new user as an editor and see its pending', async function () {
		const invitePeoplePage = await InvitePeoplePage.Expect( this.driver );
		await invitePeoplePage.inviteNewUser(
			newInviteEmailAddress,
			'editor',
			'Automated e2e testing'
		);
		const noticesComponent = await NoticesComponent.Expect( this.driver );
		await noticesComponent.isSuccessNoticeDisplayed();
		inviteCreated = true;
		await invitePeoplePage.backToPeopleMenu();

		const peoplePage = await PeoplePage.Expect( this.driver );
		await peoplePage.selectInvites();
		return await peoplePage.waitForPendingInviteDisplayedFor( newInviteEmailAddress );
	} );

	it( 'Can see an invitation email received for the invite', async function () {
		const emails = await emailClient.pollEmailsByRecipient( newInviteEmailAddress );
		const links = emails[ 0 ].html.links;
		const link = links.find( ( l ) => l.href.includes( 'accept-invite' ) );
		acceptInviteURL = dataHelper.adjustInviteLinkToCorrectEnvironment( link.href );
		return assert.notEqual(
			acceptInviteURL,
			'',
			'Could not locate the accept invite URL in the invite email'
		);
	} );

	it( 'Can sign up as new user for the blog via invite link', async function () {
		await driverManager.ensureNotLoggedIn( this.driver );

		await this.driver.get( acceptInviteURL );
		const acceptInvitePage = await AcceptInvitePage.Expect( this.driver );

		const actualEmailAddress = await acceptInvitePage.getEmailPreFilled();
		const headerInviteText = await acceptInvitePage.getHeaderInviteText();
		assert.strictEqual( actualEmailAddress, newInviteEmailAddress );
		assert( headerInviteText.includes( 'editor' ) );

		await acceptInvitePage.enterUsernameAndPasswordAndSignUp( newUserName, password );
		return await acceptInvitePage.waitUntilNotVisible();
	} );

	it( 'User has been added as Editor', async function () {
		await PostsPage.Expect( this.driver );

		inviteAccepted = true;
		const noticesComponent = await NoticesComponent.Expect( this.driver );
		const invitesMessageTitleDisplayed = await noticesComponent.getNoticeContent();
		return assert(
			invitesMessageTitleDisplayed.includes( 'Editor' ),
			`The invite message '${ invitesMessageTitleDisplayed }' does not include 'Editor'`
		);
	} );

	it( 'As the original user can see and remove new user', async function () {
		await new LoginFlow( this.driver ).loginAndSelectPeople();

		const peoplePage = await PeoplePage.Expect( this.driver );
		await peoplePage.selectTeam();
		await peoplePage.searchForUser( newUserName );
		const numberPeopleShown = await peoplePage.numberSearchResults();
		assert.strictEqual(
			numberPeopleShown,
			1,
			`The number of people search results for '${ newUserName }' was incorrect`
		);

		await peoplePage.selectOnlyPersonDisplayed();
		const editTeamMemberPage = await EditTeamMemberPage.Expect( this.driver );
		await editTeamMemberPage.removeUserAndDeleteContent();
		const noticesComponent = await NoticesComponent.Expect( this.driver );
		const displayed = await noticesComponent.isSuccessNoticeDisplayed();
		return assert.strictEqual(
			displayed,
			true,
			'The deletion successful notice was not shown on the people page.'
		);
	} );

	it( 'As the invited user, I am no longer an editor on the site', async function () {
		if ( 'WPCOM' !== dataHelper.getJetpackHost() ) return this.skip();
		const loginPage = await LoginPage.Visit( this.driver );
		await loginPage.login( newUserName, password );
		await ReaderPage.Expect( this.driver );

		const navBarComponent = await NavBarComponent.Expect( this.driver );
		await navBarComponent.clickMySites();
		return await NoSitesComponent.Expect( this.driver );
	} );

	after( async function () {
		if ( inviteCreated ) {
			try {
				await new LoginFlow( this.driver ).loginAndSelectPeople();
				const peoplePage = await PeoplePage.Expect( this.driver );
				await peoplePage.selectInvites();

				// Sometimes, the 'accept invite' step fails. In these cases, we perform cleanup
				//    by revoking, instead of clearing accepted invite.
				if ( inviteAccepted ) {
					await peoplePage.goToClearAcceptedInvitePage( newUserName );
				} else {
					await peoplePage.goToRevokeInvitePage( newInviteEmailAddress );
				}

				const clearOrRevokeInvitePage = await RevokePage.Expect( this.driver );
				await clearOrRevokeInvitePage.revokeUser();
			} catch {
				console.log( 'Invites cleanup failed for (Inviting new user as an Editor)' );
				return;
			}
		}
	} );
} );
