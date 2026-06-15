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
		// A second comment, exercised by the Trash step. Spam and Trash both
		// return to the list view in the redesigned panel, so each terminal
		// action needs its own notification.
		const commentToTrash = DataHelper.getRandomPhrase() + ' notification-actions-spec';

		// TestAccount and RestAPI instances.
		let commentingUser: TestAccount;
		let notificationsUser: TestAccount;
		let commentingUserRestAPIClient: RestAPIClient;
		let notificationUserRestAPIClient: RestAPIClient;

		// API responses.
		let newPost: PostResponse;
		let newComment: NewCommentResponse;
		let newCommentToTrash: NewCommentResponse;

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

			// Create the comments on the post as the commentingUser and store the
			// responses. One drives the Approve/Like/Spam flow, the other Trash.
			newComment = await commentingUserRestAPIClient.createComment(
				notificationsUser.credentials.testSites?.primary.id as number,
				newPost.ID,
				comment
			);
			newCommentToTrash = await commentingUserRestAPIClient.createComment(
				notificationsUser.credentials.testSites?.primary.id as number,
				newPost.ID,
				commentToTrash
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
		} );

		it( 'Trash comment', async function () {
			// Use the dedicated second notification: the first was spammed, which
			// returned to the list view.
			await notificationsComponent.openNotification( commentToTrash );
			await notificationsComponent.trashNotification();
		} );

		afterAll( async function () {
			const siteId = notificationsUser.credentials.testSites?.primary.id as number;

			// Clean up the comments.
			for ( const createdComment of [ newComment, newCommentToTrash ] ) {
				if ( ! createdComment ) {
					continue;
				}
				try {
					await notificationUserRestAPIClient.deleteComment( siteId, createdComment.ID );
				} catch ( e: unknown ) {
					console.warn(
						`Failed to clean up test comment in notification_action spec for site ${ siteId }, comment ${ createdComment.ID }`
					);
				}
			}

			if ( ! newPost ) {
				return;
			}

			// Clean up the post.
			try {
				await notificationUserRestAPIClient.deletePost( siteId, newPost.ID );
			} catch ( e: unknown ) {
				console.warn(
					`Failed to clean up test post in notification_action spec for site ${ siteId }, post ${ newPost.ID }`
				);
			}
		} );
	}
);
