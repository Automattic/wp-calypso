/**
 * @group calypso-pr
 */

import {
	DataHelper,
	NavbarComponent,
	NotificationsComponent,
	RestAPIClient,
	TestAccount,
	NewCommentResponse,
	PostResponse,
	envVariables,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { skipDescribeIf } from '../../jest-helpers';

declare const browser: Browser;

/**
 * Tests general interaction with the notification panel, running through
 * all actions once.
 */
skipDescribeIf( envVariables.VIEWPORT_NAME === 'mobile' )(
	'Notifications: General Interactions',
	function () {
		const comment = DataHelper.getRandomPhrase() + ' notification-actions-spec';

		// TestAccount and RestAPI instances.
		let commentingUser: TestAccount;
		let notificationsUser: TestAccount;
		let commentingUserRestAPIClient: RestAPIClient;
		let notificationUserRestAPIClient: RestAPIClient;

		// API responses.
		let newPost: PostResponse;
		let newComment: NewCommentResponse;

		let notificationsComponent: NotificationsComponent;
		let page: Page;

		beforeAll( async function () {
			// Create an instance of RestAPI as the user making the comment.
			commentingUser = new TestAccount( 'commentingUser' );
			commentingUserRestAPIClient = new RestAPIClient( commentingUser.credentials );

			// Create an instance of RestAPI as the user receiving notification.
			notificationsUser = new TestAccount( 'notificationsUser' );
			notificationUserRestAPIClient = new RestAPIClient( notificationsUser.credentials );

			// Create a new post and store the response.
			newPost = await notificationUserRestAPIClient.createPost(
				notificationsUser.credentials.testSites?.primary.id as number,
				{ title: DataHelper.getRandomPhrase() }
			);

			// Create a new comment on the post as the commentingUser and
			// store the response.
			newComment = await commentingUserRestAPIClient.createComment(
				notificationsUser.credentials.testSites?.primary.id as number,
				newPost.ID,
				comment
			);

			// Log in as the user receiving the notification.
			page = await browser.newPage();
			await notificationsUser.authenticate( page, { waitUntilStable: true } );
		} );

		it( 'Open Notifications panel', async function () {
			const navbarComponent = new NavbarComponent( page );
			await navbarComponent.openNotificationsPanel();
		} );

		it( 'Click notification for the comment', async function () {
			notificationsComponent = new NotificationsComponent( page );
			await notificationsComponent.openNotification( comment );
		} );

		it( 'Approve comment', async function () {
			await notificationsComponent.clickNotificationAction( 'Approve' );
		} );

		it( 'Like comment', async function () {
			await notificationsComponent.clickNotificationAction( 'Like' );
		} );

		it( 'Mark comment as spam', async function () {
			await notificationsComponent.clickNotificationAction( 'Spam' );
			await notificationsComponent.clickUndo();
		} );

		it( 'Trash comment', async function () {
			await notificationsComponent.clickNotificationAction( 'Trash' );
		} );

		afterAll( async function () {
			if ( ! newComment ) {
				return;
			}

			// Clean up the comment.
			try {
				await notificationUserRestAPIClient.deleteComment(
					notificationsUser.credentials.testSites?.primary.id as number,
					newComment.ID
				);
			} catch ( e: unknown ) {
				console.warn(
					`Failed to clean up test comment in notification_action spec for site ${
						notificationsUser.credentials.testSites?.primary.id as number
					}, comment ${ newComment.ID }`
				);
			}

			if ( ! newPost ) {
				return;
			}

			// Clean up the post.
			try {
				await notificationUserRestAPIClient.deletePost(
					notificationsUser.credentials.testSites?.primary.id as number,
					newPost.ID
				);
			} catch ( e: unknown ) {
				console.warn(
					`Failed to clean up test comment in notification_action spec for site ${
						notificationsUser.credentials.testSites?.primary.id as number
					}, comment ${ newComment.ID }`
				);
			}
		} );
	}
);
