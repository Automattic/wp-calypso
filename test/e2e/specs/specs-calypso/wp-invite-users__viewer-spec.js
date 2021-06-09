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
import PeoplePage from '../../lib/pages/people-page.js';
import RevokePage from '../../lib/pages/revoke-page.js';
import InvitePeoplePage from '../../lib/pages/invite-people-page.js';
import LoginPage from '../../lib/pages/login-page.js';
import ReaderPage from '../../lib/pages/reader-page.js';
import ViewBlogPage from '../../lib/pages/signup/view-blog-page.js';
import PrivateSiteLoginPage from '../../lib/pages/private-site-login-page.js';
import NoticesComponent from '../../lib/components/notices-component.js';

import * as dataHelper from '../../lib/data-helper.js';
import * as driverManager from '../../lib/driver-manager.js';
import EmailClient from '../../lib/email-client.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const inviteInboxId = config.get( 'inviteInboxId' );
const password = config.get( 'passwordForNewTestSignUps' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const emailClient = new EmailClient( inviteInboxId );

/**
 * This test creates new invtites and try to clean them up. The problem is the invites are per-site,
 * so all test runs will share the same list of invites. It causes this test to be flaky when run in
 * parallel.
 */
describe.skip( `[${ host }] Invites - New user as Viewer: (${ screenSize }) @parallel`, function () {
	this.timeout( mochaTimeOut );
	const newUserName = 'e2eflowtestingviewer' + new Date().getTime().toString();
	const newInviteEmailAddress = dataHelper.getEmailAddress( newUserName, inviteInboxId );
	const siteName = config.get( 'privateSiteForInvites' );
	const siteUrl = `https://${ siteName }/`;
	let removedViewerFlag = true;
	let acceptInviteURL = '';
	let inviteCreated = false;
	let inviteAccepted = false;

	it( 'As an anonymous user I can not see a private site', async function () {
		return await PrivateSiteLoginPage.Visit( this.driver, siteUrl );
	} );

	it( 'Can log in and navigate to Invite People page', async function () {
		await new LoginFlow( this.driver, 'privateSiteUser' ).loginAndSelectPeople();
		const peoplePage = await PeoplePage.Expect( this.driver );
		return await peoplePage.inviteUser();
	} );

	it( 'Can invite a new user as a viewer and see its pending', async function () {
		const invitePeoplePage = await InvitePeoplePage.Expect( this.driver );
		await invitePeoplePage.inviteNewUser(
			newInviteEmailAddress,
			'viewer',
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
		assert( headerInviteText.includes( 'view' ) );

		await acceptInvitePage.enterUsernameAndPasswordAndSignUp( newUserName, password );
		removedViewerFlag = false;
		return await acceptInvitePage.waitUntilNotVisible();
	} );

	it( 'Can see user has been added as a Viewer', async function () {
		inviteAccepted = true;
		const noticesComponent = await NoticesComponent.Expect( this.driver );
		const followMessageDisplayed = await noticesComponent.getNoticeContent();
		assert.strictEqual(
			true,
			followMessageDisplayed.includes( 'viewer' ),
			`The follow message '${ followMessageDisplayed }' does not include 'viewer'`
		);

		await ReaderPage.Expect( this.driver );
		return await ViewBlogPage.Visit( this.driver, siteUrl );
	} );

	it( 'Can see new user added and can be removed', async function () {
		await new LoginFlow( this.driver, 'privateSiteUser' ).loginAndSelectPeople();

		const peoplePage = await PeoplePage.Expect( this.driver );
		await peoplePage.selectViewers();
		let displayed = await peoplePage.viewerDisplayed( newUserName );
		assert( displayed, `The username of '${ newUserName }' was not displayed as a site viewer` );

		await peoplePage.removeUserByName( newUserName );
		await peoplePage.waitForSearchResults();
		displayed = await peoplePage.viewerDisplayed( newUserName );
		if ( displayed === false ) {
			removedViewerFlag = true;
		}
		return assert.strictEqual(
			displayed,
			false,
			`The username of '${ newUserName }' was still displayed as a site viewer`
		);
	} );

	it( 'Can not see the site - see the private site log in page', async function () {
		const loginPage = await LoginPage.Visit( this.driver );
		await loginPage.login( newUserName, password );

		await ReaderPage.Expect( this.driver );
		return await PrivateSiteLoginPage.Visit( this.driver, siteUrl );
	} );

	after( async function () {
		if ( inviteCreated ) {
			try {
				await new LoginFlow( this.driver, 'privateSiteUser' ).loginAndSelectPeople();
				const peoplePageCleanup = await PeoplePage.Expect( this.driver );
				await peoplePageCleanup.selectInvites();

				// Sometimes, the 'accept invite' step fails. In these cases, we perform cleanup
				//    by revoking, instead of clearing accepted invite.
				if ( inviteAccepted ) {
					await peoplePageCleanup.goToClearAcceptedInvitePage( newUserName );
				} else {
					await peoplePageCleanup.goToRevokeInvitePage( newInviteEmailAddress );
				}

				const clearOrRevokeInvitePage = await RevokePage.Expect( this.driver );
				await clearOrRevokeInvitePage.revokeUser();
			} catch {
				console.log(
					'Invites cleanup failed for (Inviting New User as a Viewer of a WordPress.com Private Site)'
				);
				return;
			}
		}

		if ( ! removedViewerFlag ) {
			await new LoginFlow( this.driver, 'privateSiteUser' ).loginAndSelectPeople();
			const peoplePage = await PeoplePage.Expect( this.driver );

			await peoplePage.selectViewers();
			const displayed = await peoplePage.viewerDisplayed( newUserName );
			if ( displayed ) {
				await peoplePage.removeUserByName( newUserName );

				return await peoplePage.waitForSearchResults();
			}
		}
	} );
} );
