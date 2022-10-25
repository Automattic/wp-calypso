/**
 * @group quarantined
 */

import {
	DataHelper,
	NavbarComponent,
	NotificationsComponent,
	RestAPIClient,
	TestAccount,
	SecretsManager,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Notifications' ), function () {
	const commentingUser = 'commentingUser';
	const notificationsUser = 'notificationsUser';
	const comment = DataHelper.getRandomPhrase() + ' notifications-trash-spec';

	let notificationsComponent: NotificationsComponent;
	let restAPIClient: RestAPIClient;

	describe( `Trash comment as ${ notificationsUser }`, function () {
		let page: Page;

		beforeAll( async function () {
			// Authenticate the commenting user with the REST API.
			restAPIClient = new RestAPIClient( SecretsManager.secrets.testAccounts.commentingUser );

			// Get the first post from the blogs a user follows.
			const response = await restAPIClient.getReaderFeed();
			const siteID = response.siteID;
			const postID = response.postID;

			// Add a comment to the post.
			await restAPIClient.createComment( siteID, postID, comment );

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

		it( 'Delete comment from notification', async function () {
			await notificationsComponent.clickNotificationAction( 'Trash' );
		} );

		it( 'Confirm comment is trashed', async function () {
			await notificationsComponent.waitForUndoMessage();
			await notificationsComponent.waitForUndoMessageToDisappear();
		} );
	} );
} );
