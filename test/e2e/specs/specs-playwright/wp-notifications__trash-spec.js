/**
 * @group calypso-pr
 */

import {
	setupHooks,
	BrowserManager,
	DataHelper,
	LoginFlow,
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
	const comment = DataHelper.getRandomPhrase() + ' TBD';

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( `Leave a comment as ${ commentingUser }`, function () {
		let testPage;

		it( `Log in as ${ commentingUser }`, async function () {
			testPage = await BrowserManager.newPage( { newContext: true } );
			const loginFlow = new LoginFlow( testPage, commentingUser );
			await loginFlow.logIn();
			await testPage.waitForURL( '**/read' );
		} );

		it( 'View site', async function () {
			// TODO make a utility to obtain a blog URL without string substitution.
			const siteURL = `https://${ DataHelper.config.get( 'testSiteForNotifications' ) }`;
			await testPage.goto( siteURL );
		} );

		it( 'View first post', async function () {
			publishedPostsListPage = new PublishedPostsListPage( testPage );
			publishedPostsListPage.visitPost( 1 );
		} );

		it( 'Comment on the post', async function () {
			const commentsComponent = new CommentsComponent( testPage );
			await commentsComponent.postComment( comment );
		} );
	} );

	describe( `Trash comment as ${ notificationsUser }`, function () {
		it( `Log in as ${ notificationsUser }`, async function () {
			const loginFlow = new LoginFlow( page, notificationsUser );
			await loginFlow.logIn();
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
