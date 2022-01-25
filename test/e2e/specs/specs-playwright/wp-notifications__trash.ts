/**
 * @group quarantined
 */

import {
	DataHelper,
	ReaderPage,
	NavbarComponent,
	NotificationsComponent,
	TestAccount,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Notifications' ), function () {
	const commentingUser = 'commentingUser';
	const notificationsUser = 'notificationsUser';
	const comment = DataHelper.getRandomPhrase() + ' notifications-trash-spec';

	let notificationsComponent: NotificationsComponent;
	let readerPage: ReaderPage;

	describe( `Leave a comment as ${ commentingUser }`, function () {
		let page: Page;
		let testAccount: TestAccount;

		beforeAll( async function () {
			page = await browser.newPage();
			testAccount = new TestAccount( commentingUser );
			await testAccount.authenticate( page );
		} );

		it( 'Visit latest post in reader stream', async function () {
			readerPage = new ReaderPage( page );
			await readerPage.visitPost( { index: 1 } );
		} );

		it( 'Leave a comment on the post', async function () {
			await readerPage.comment( comment );
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
