/**
 * @group calypso-pr
 */

import {
	setupHooks,
	BrowserManager,
	DataHelper,
	LoginPage,
	PublishedPostsListPage,
	CommentsComponent,
	NavbarComponent,
	NotificationsComponent,
} from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'Notifications' ), function () {
	let page;
	let publishedPostsListPage;
	let notificationsComponent;

	const commentingUser = 'commentingUser';
	const notificationsUser = 'notificationsUser';
	const comment = DataHelper.getRandomPhrase() + ' notifications-trash-spec';

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( `Leave a comment as ${ commentingUser }`, function () {
		it( `Log in as ${ commentingUser }`, async function () {
			const loginPage = new LoginPage( page );
			await loginPage.login( { account: commentingUser }, { landingUrl: '**/read' } );
		} );

		it( 'View site', async function () {
			// TODO make a utility to obtain a blog URL without string substitution.
			const siteURL = `https://${ DataHelper.config.get( 'testSiteForNotifications' ) }`;
			await page.goto( siteURL );
		} );

		it( 'View first post', async function () {
			publishedPostsListPage = new PublishedPostsListPage( page );
			publishedPostsListPage.visitPost( 1 );
		} );

		it( 'Comment on the post', async function () {
			const commentsComponent = new CommentsComponent( page );
			await commentsComponent.postComment( comment );
		} );

		it( 'Clear authentication state', async function () {
			await BrowserManager.clearAuthenticationState( page );
		} );
	} );

	describe( `Trash comment as ${ notificationsUser }`, function () {
		it( `Log in as ${ notificationsUser }`, async function () {
			const loginPage = new LoginPage( page );
			await loginPage.login( { account: notificationsUser } );
		} );

		it( 'Open notification using keyboard shortcut', async function () {
			const navbarComponent = new NavbarComponent( page );
			await navbarComponent.openNotificationsPanel( { useKeyboard: true } );
		} );

		it( `See notification for the comment left by ${ commentingUser }`, async function () {
			notificationsComponent = new NotificationsComponent( page );
			await notificationsComponent.clickNotification( comment );
		} );

		it( 'Delete comment from notification', async function () {
			await notificationsComponent.clickNotificationAction( 'Trash' );
		} );

		it( 'Confirm comment is trashed', async function () {
			await notificationsComponent.waitForUndoMessage();
			await notificationsComponent.waitForUndoMessageToDisappear();
		} );
	} );
} );
