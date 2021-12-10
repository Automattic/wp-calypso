/**
 * @group calypso-pr
 */

import {
	DataHelper,
	LoginPage,
	setupHooks,
	ReaderPage,
	NotificationsComponent,
	NavbarComponent,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Reader: View and Comment' ), function () {
	let page: Page;
	let loginPage: LoginPage;
	let readerPage: ReaderPage;
	let notificationsComponent: NotificationsComponent;
	const comment = DataHelper.getRandomPhrase() + ' wp-reader__view-spec';

	setupHooks( ( args: { page: Page } ) => {
		page = args.page;
	} );

	it( 'Log in as commenting user', async function () {
		loginPage = new LoginPage( page );
		readerPage = new ReaderPage( page );

		await readerPage.visit();
		await loginPage.logInWithTestAccount( 'commentingUser' );
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

	it( 'Log in as a site owner', async function () {
		await loginPage.visit();
		await loginPage.clickChangeAccount();
		await loginPage.logInWithTestAccount( 'notificationsUser' );
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
