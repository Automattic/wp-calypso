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
	const comment = DataHelper.getRandomPhrase() + ' notifications-trash-spec';

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

	describe( `Trash comment as ${ notificationsUser }`, function () {
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

		it( 'Delete comment from notification', async function () {
			await notificationsComponent.clickNotificationAction( 'Trash' );
		} );

		it( 'Confirm comment is trashed', async function () {
			await notificationsComponent.waitForUndoMessage();
			await notificationsComponent.waitForUndoMessageToDisappear();
		} );
	} );
} );
