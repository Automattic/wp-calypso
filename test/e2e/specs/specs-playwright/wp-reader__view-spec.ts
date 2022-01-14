/**
 * @group calypso-pr
 */

import {
	DataHelper,
	TestAccount,
	setupHooks,
	ReaderPage,
	NotificationsComponent,
	NavbarComponent,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Reader: View and Comment' ), function () {
	let page: Page;
	let readerPage: ReaderPage;
	let notificationsComponent: NotificationsComponent;
	const comment = DataHelper.getRandomPhrase() + ' wp-reader__view-spec';

	setupHooks( ( args: { page: Page } ) => {
		page = args.page;
		readerPage = new ReaderPage( page );
	} );

	describe( 'As the commenting user', () => {
		let testAccount: TestAccount;
		beforeAll( async () => {
			testAccount = new TestAccount( 'commentingUser' );
			await testAccount.authenticate( page );
		} );

		it( 'Go to Reader page', async function () {
			await readerPage.visit();
		} );

		it( 'View the Reader stream', async function () {
			const testSiteForNotifications = DataHelper.config.get( 'testSiteForNotifications' );
			const siteOfLatestPost = await readerPage.siteOfLatestPost();
			expect( siteOfLatestPost ).toEqual( testSiteForNotifications );
		} );

		it( 'Visit latest post', async function () {
			await readerPage.visitPost( { index: 1 } );
		} );

		it( 'Comment and confirm it is shown', async function () {
			await readerPage.comment( comment );
		} );
	} );

	describe( 'As the site owner', () => {
		beforeAll( async () => {
			const testAccount = new TestAccount( 'notificationsUser' );
			await testAccount.authenticate( page );
		} );

		it( 'Open Notifications panel', async function () {
			const navBarComponent = new NavbarComponent( page );
			await navBarComponent.openNotificationsPanel();
		} );

		it( 'Delete the new comment', async function () {
			notificationsComponent = new NotificationsComponent( page );
			await notificationsComponent.clickNotification( comment );
			await notificationsComponent.clickNotificationAction( 'Trash' );
		} );

		it( 'Wait for Undo Message to display and then disappear', async function () {
			await notificationsComponent.waitForUndoMessage();
			await notificationsComponent.waitForUndoMessageToDisappear();
		} );
	} );
} );
