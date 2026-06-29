/**
 * Tests general interaction with the notification panel, running through
 * all actions once.
 */

import {
	DataHelper,
	NavbarComponent,
	NewCommentResponse,
	NotificationsComponent,
	PostResponse,
	RestAPIClient,
	TestAccount,
	envVariables,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

test.describe( 'Notifications: General Interactions', { tag: [ tags.CALYPSO_PR ] }, () => {
	const comment = DataHelper.getRandomPhrase() + ' notification-actions-spec';
	// Spam and Trash both return to list view in the redesigned panel, so each
	// terminal action needs its own notification.
	const commentToTrash = DataHelper.getRandomPhrase() + ' notification-actions-spec';

	let newPost: PostResponse;
	let newComment: NewCommentResponse;
	let newCommentToTrash: NewCommentResponse;
	let notificationsUser: TestAccount;
	let notificationUserRestAPIClient: RestAPIClient;
	let commentingUserRestAPIClient: RestAPIClient;

	test.afterAll( async () => {
		for ( const createdComment of [ newComment, newCommentToTrash ] ) {
			if ( ! createdComment ) {
				continue;
			}
			try {
				await notificationUserRestAPIClient.deleteComment(
					notificationsUser.credentials.testSites?.primary.id as number,
					createdComment.ID
				);
			} catch ( e: unknown ) {
				console.warn( 'Failed to clean up test comment' );
			}
		}

		if ( newPost ) {
			try {
				await notificationUserRestAPIClient.deletePost(
					notificationsUser.credentials.testSites?.primary.id as number,
					newPost.ID
				);
			} catch ( e: unknown ) {
				console.warn( 'Failed to clean up test post' );
			}
		}
	} );

	test( 'As a user, I can interact with notifications', async ( { page } ) => {
		test.skip( envVariables.VIEWPORT_NAME === 'mobile', 'Skipped on mobile viewport' );

		let notificationsComponent: NotificationsComponent;

		await test.step( 'Setup: create post and comment via API', async () => {
			const commentingUser = new TestAccount( 'commentingUser' );
			commentingUserRestAPIClient = new RestAPIClient( commentingUser.credentials );

			notificationsUser = new TestAccount( 'notificationsUser' );
			notificationUserRestAPIClient = new RestAPIClient( notificationsUser.credentials );

			newPost = await notificationUserRestAPIClient.createPost(
				notificationsUser.credentials.testSites?.primary.id as number,
				{ title: DataHelper.getRandomPhrase() }
			);

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

			await notificationsUser.authenticate( page, { waitUntilStable: true } );
		} );

		await test.step( 'Open Notifications panel', async () => {
			const navbarComponent = new NavbarComponent( page );
			await navbarComponent.openNotificationsPanel();
		} );

		await test.step( 'Click notification for the comment', async () => {
			notificationsComponent = new NotificationsComponent( page );
			await notificationsComponent.openNotification( comment );
		} );

		await test.step( 'Approve comment', async () => {
			await notificationsComponent.clickNotificationAction( 'Approve' );
		} );

		await test.step( 'Like comment', async () => {
			await notificationsComponent.clickNotificationAction( 'Like' );
		} );

		await test.step( 'Mark comment as spam', async () => {
			await notificationsComponent.clickNotificationAction( 'Spam' );
		} );

		await test.step( 'Trash comment', async () => {
			// First notification was spammed and returned to list view; use the
			// dedicated second notification.
			await notificationsComponent.openNotification( commentToTrash );
			await notificationsComponent.trashNotification();
		} );
	} );
} );
