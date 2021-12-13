/**
 * @group quarantined
 */

import {
	setupHooks,
	DataHelper,
	LoginPage,
	PublishedPostsListPage,
	CommentsComponent,
	NavbarComponent,
	NotificationsComponent,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Notifications' ), function () {
	let page: Page;
	let loginPage: LoginPage;
	let publishedPostsListPage: PublishedPostsListPage;
	let notificationsComponent: NotificationsComponent;

	const commentingUser = 'commentingUser';
	const notificationsUser = 'notificationsUser';
	const comment = DataHelper.getRandomPhrase() + ' notifications-trash-spec';

	setupHooks( ( args ) => {
		page = args.page;
		loginPage = new LoginPage( page );
	} );

	describe( `Leave a comment as ${ commentingUser }`, function () {
		it( `Log in as ${ commentingUser }`, async function () {
			await loginPage.visit();
			await loginPage.logInWithTestAccount( commentingUser );
		} );

		it( 'Visit published site', async function () {
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
	} );

	describe( `Trash comment as ${ notificationsUser }`, function () {
		it( `Log in as ${ notificationsUser }`, async function () {
			await loginPage.visit();
			await loginPage.clickChangeAccount();
			await loginPage.logInWithTestAccount( notificationsUser );
		} );

		it( 'Open notification using keyboard shortcut', async function () {
			const navbarComponent = new NavbarComponent( page );
			await navbarComponent.openNotificationsPanel( { useKeyboard: true } );
		} );

		it( `See and click notification for the comment left by ${ commentingUser }`, async function () {
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
