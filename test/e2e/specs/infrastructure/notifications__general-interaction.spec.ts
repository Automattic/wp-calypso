import {
	DataHelper,
	NavbarComponent,
	NotificationsComponent,
	RestAPIClient,
	TestAccount,
	NewCommentResponse,
	PostResponse,
} from '@automattic/calypso-e2e';
import { Page } from '@playwright/test';
import { test } from '../../lib/pw-base';

test.describe( 'Notifications: General Interactions', () => {
	test.skip( ( { viewportName } ) => viewportName === 'mobile', 'Skipped on mobile viewports' );

	let comment: string;
	let commentingUser: TestAccount;
	let notificationsUser: TestAccount;
	let commentingUserRestAPIClient: RestAPIClient;
	let notificationUserRestAPIClient: RestAPIClient;
	let newPost: PostResponse;
	let newComment: NewCommentResponse;
	let testPage: Page;
	let notificationsComponent: NotificationsComponent;

	test.beforeAll( async ( { browser } ) => {
		comment = DataHelper.getRandomPhrase() + ' notification-actions-spec';

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
		testPage = await browser.newPage();
		await notificationsUser.authenticate( testPage, { waitUntilStable: true } );
	} );

	test( 'Given a user receives a comment notification When they open the notifications panel Then the notification appears', async () => {
		const navbarComponent = new NavbarComponent( testPage );
		await navbarComponent.openNotificationsPanel();

		notificationsComponent = new NotificationsComponent( testPage );
		await notificationsComponent.openNotification( comment );
	} );

	test( 'Given a comment notification is displayed When the user approves the comment Then the comment is approved', async () => {
		await notificationsComponent.clickNotificationAction( 'Approve' );
	} );

	test( 'Given an approved comment When the user likes the comment Then the comment is liked', async () => {
		await notificationsComponent.clickNotificationAction( 'Like' );
	} );

	test( 'Given a liked comment When the user marks it as spam and undoes Then the spam action is undone', async () => {
		await notificationsComponent.clickNotificationAction( 'Spam' );
		await notificationsComponent.clickUndo();
	} );

	test( 'Given a comment notification When the user trashes the comment Then the comment is moved to trash', async () => {
		await notificationsComponent.clickNotificationAction( 'Trash' );
	} );

	test.afterAll( async () => {
		if ( newComment ) {
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
		}

		if ( newPost ) {
			// Clean up the post.
			try {
				await notificationUserRestAPIClient.deletePost(
					notificationsUser.credentials.testSites?.primary.id as number,
					newPost.ID
				);
			} catch ( e: unknown ) {
				console.warn(
					`Failed to clean up test post in notification_action spec for site ${
						notificationsUser.credentials.testSites?.primary.id as number
					}, post ${ newPost.ID }`
				);
			}
		}

		// Close the test page.
		if ( testPage ) {
			await testPage.close();
		}
	} );
} );
