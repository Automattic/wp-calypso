/**
 * @group calypso-pr
 */

import {
	DataHelper,
	NavbarComponent,
	NotificationsComponent,
	RestAPIClient,
	ReaderResponse,
	SecretsManager,
	TestAccount,
	NewCommentResponse,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Notifications' ), function () {
	const commentingUser = 'commentingUser';
	const notificationsUser = 'notificationsUser';
	const comment = DataHelper.getRandomPhrase() + ' notification-actions-spec';

	let notificationsComponent: NotificationsComponent;
	let restAPIClient: RestAPIClient;
	let siteID: number;
	let commentID: number;

	describe( `Leave a comment as ${ commentingUser }`, function () {
		let postID: number;

		beforeAll( async function () {
			restAPIClient = new RestAPIClient( SecretsManager.secrets.testAccounts.commentingUser );
		} );

		it( 'Get the latest post in reader stream', async function () {
			const response: ReaderResponse = await restAPIClient.getReaderFeed();
			siteID = response.posts[ 0 ].site_ID;
			postID = response.posts[ 0 ].ID;
		} );

		it( 'Leave a comment on the post', async function () {
			const response: NewCommentResponse = await restAPIClient.createComment(
				siteID,
				postID,
				comment
			);
			commentID = response.ID;
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
			await notificationsComponent.clickNotificationAction( 'Approve' );
		} );

		it( 'Unapprove comment', async function () {
			await notificationsComponent.clickNotificationAction( 'Approve' );
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

	describe( 'Mark comment as spam from notification', function () {
		it( 'Mark comment as spam', async function () {
			await notificationsComponent.clickNotificationAction( 'Spam' );
		} );

		it( 'Undo mark comment as spam', async function () {
			await notificationsComponent.clickUndo();
		} );
	} );

	describe( 'Trash comment from notification', function () {
		it( 'Trash comment', async function () {
			await notificationsComponent.clickNotificationAction( 'Trash' );
		} );

		it( 'Undo trash comment', async function () {
			await notificationsComponent.clickUndo();
		} );
	} );

	// Delete test comment that was created.
	afterAll( async function () {
		if ( typeof commentID === 'undefined' ) {
			console.log( 'commentid ' + commentID );
			return;
		}

		try {
			restAPIClient = new RestAPIClient( SecretsManager.secrets.testAccounts.notificationsUser );
			await restAPIClient.deleteComment( siteID, commentID );
			console.log( 'Successfully cleaned up comment.' );
		} catch ( e: unknown ) {
			console.warn( `Failed to clean up test comment from user ${ commentingUser }` );
		}
	} );
} );
