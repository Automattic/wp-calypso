import assert from 'assert';
import config from 'config';
import NavBarComponent from '../../lib/components/nav-bar-component.js';
import NotificationsComponent from '../../lib/components/notifications-component.js';
import * as dataHelper from '../../lib/data-helper';
import * as driverManager from '../../lib/driver-manager.js';
import LoginFlow from '../../lib/flows/login-flow.js';
import ViewPostPage from '../../lib/pages/view-post-page.js';
import ViewSitePage from '../../lib/pages/view-site-page.js';
import * as slackNotifier from '../../lib/slack-notifier';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Notifications: (${ screenSize }) @parallel`, function () {
	this.timeout( mochaTimeOut );

	const commentingUser = dataHelper.getAccountConfig( 'commentingUser' )[ 0 ];
	const comment = dataHelper.randomPhrase() + ' TBD';
	let commentedPostTitle;

	it( 'Can log in as commenting user', async function () {
		const loginFlow = new LoginFlow( this.driver, 'commentingUser' );
		return await loginFlow.login();
	} );

	it( 'Can view the first post', async function () {
		const testSiteForInvitationsURL = `https://${ dataHelper.configGet(
			'testSiteForNotifications'
		) }`;
		const viewBlogPage = await ViewSitePage.Visit( this.driver, testSiteForInvitationsURL );
		return await viewBlogPage.viewFirstPost();
	} );

	it( 'Can see the first post page and capture the title', async function () {
		const viewPostPage = await ViewPostPage.Expect( this.driver );
		commentedPostTitle = await viewPostPage.postTitle();
	} );

	it( 'Can leave a comment', async function () {
		const viewPostPage = await ViewPostPage.Expect( this.driver );
		return await viewPostPage.leaveAComment( comment );
	} );

	it( 'Can see the comment', async function () {
		const viewPostPage = await ViewPostPage.Expect( this.driver );
		const shown = await viewPostPage.commentEventuallyShown( comment );
		if ( shown === false ) {
			return slackNotifier.warn(
				`Could not see newly added comment '${ comment }' on blog page - most likely a refresh issue`
			);
		}
	} );

	it( 'Can log in as notifications user', async function () {
		const loginFlow = new LoginFlow( this.driver, 'notificationsUser' );
		return await loginFlow.login();
	} );

	it( 'Can open notifications tab with keyboard shortcut', async function () {
		const navBarComponent = await NavBarComponent.Expect( this.driver );
		await navBarComponent.openNotificationsShortcut();
		const isOpen = await navBarComponent.isNotificationsTabOpen();
		return assert( isOpen, 'Notifications tab is not open' );
	} );

	it( 'Can see the notification of the comment', async function () {
		const expectedContent = `${ commentingUser } commented on ${ commentedPostTitle }\n${ comment }`;
		const navBarComponent = await NavBarComponent.Expect( this.driver );
		await navBarComponent.openNotifications();
		const notificationsComponent = await NotificationsComponent.Expect( this.driver );
		await notificationsComponent.selectComments();
		const content = await notificationsComponent.allCommentsContent();
		return assert.strictEqual(
			content.includes( expectedContent ),
			true,
			`The actual notifications content '${ content }' does not contain expected content '${ expectedContent }'`
		);
	} );

	it( 'Can delete the comment (and wait for UNDO grace period so it is actually deleted)', async function () {
		const notificationsComponent = await NotificationsComponent.Expect( this.driver );
		await notificationsComponent.selectCommentByText( comment );
		await notificationsComponent.trashComment();
		await notificationsComponent.waitForUndoMessage();
		return await notificationsComponent.waitForUndoMessageToDisappear();
	} );
} );
