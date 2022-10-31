/**
 * @group quarantined
 */

import {
	DataHelper,
	NavbarComponent,
	NotificationsComponent,
	RestAPIClient,
	ReaderResponse,
	SecretsManager,
	TestAccount,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Notifications' ), function () {
	const commentingUser = 'commentingUser';
	const notificationsUser = 'notificationsUser';
	const comment = DataHelper.getRandomPhrase() + ' notification-actions-spec';

	let notificationsComponent: NotificationsComponent;
	let restAPIClient: RestAPIClient;

	describe( `Leave a comment as ${ commentingUser }`, function () {
		let siteID: number;
		let postID: number;

		beforeAll( async function () {
			restAPIClient = new RestAPIClient( SecretsManager.secrets.testAccounts.commentingUser );
		} );

		it( 'Get the latest post in reader stream', async function () {
			// TODO: Find a way to create the post if it's not found (less fragile).
			const response: ReaderResponse = await restAPIClient.getReaderFeed();
			siteID = response.posts[ 0 ].site_ID;
			postID = response.posts[ 0 ].ID;
		} );

		it( 'Leave a comment on the post', async function () {
			await restAPIClient.createComment( siteID, postID, comment );
			// TODO: Assert on a success status code.
		} );
	} );

	describe( `View notification as ${ notificationsUser }`, function () {
		let page: Page;

		beforeAll( async function () {
			page = await browser.newPage();
			const testAccount = new TestAccount( notificationsUser );
			await testAccount.authenticate( page );
		} );

		it( 'Open notification using keyboard shortcut', async function () {
			const navbarComponent = new NavbarComponent( page );
			await navbarComponent.openNotificationsPanel( { useKeyboard: true } );
		} );

		it( `See and click notification for the comment left by ${ commentingUser }`, async function () {
			notificationsComponent = new NotificationsComponent( page );
			await notificationsComponent.clickNotification( comment );
		} );
	} );

	describe( 'Approve comment from notification', function () {
		it( 'Approve comment', async function () {
			// TODO: Handle notifications that have been already approved.
			await notificationsComponent.clickNotificationAction( 'Approve' );
		} );

		it( 'Unapprove comment', async function () {
			await notificationsComponent.clickNotificationAction( 'Approved' );
		} );
	} );

	describe( 'Like comment from notification', function () {
		it( 'Like comment', async function () {
			await notificationsComponent.clickNotificationAction( 'Like' );
		} );

		it( 'Unlike comment', async function () {
			await notificationsComponent.clickNotificationAction( 'Liked' );
		} );
	} );

	// TODO: Edit comment from notification.

	describe( 'Mark comment as spam from notification', function () {
		it( 'Mark comment as spam', async function () {
			await notificationsComponent.clickNotificationAction( 'Spam' );
		} );

		it( 'Undo mark comment as spam', async function () {
			await notificationsComponent.clickUndo();
			// TODO: Assert comment was un-marked as spam.
		} );
	} );

	describe( 'Trash comment from notification', function () {
		it( 'Trash comment', async function () {
			await notificationsComponent.clickNotificationAction( 'Trash' );
		} );

		it( 'Undo trash comment', async function () {
			await notificationsComponent.clickUndo();
			// TODO: Assert comment was not deleted.
		} );

		it( 'Trash comment again', async function () {
			await notificationsComponent.clickNotificationAction( 'Trash' );
		} );

		it( 'Confirm comment is trashed', async function () {
			await notificationsComponent.waitForUndoMessageToDisappear();
		} );
	} );
} );
