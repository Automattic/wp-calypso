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
	let readerPage: ReaderPage;
	let notificationsComponent: NotificationsComponent;
	const comment = DataHelper.getRandomPhrase() + 'wp-reader__view-spec';

	setupHooks( ( args: { page: Page } ) => {
		page = args.page;
	} );

	it( 'Log in', async function () {
		const loginPage = new LoginPage( page );
		await loginPage.login( { account: 'commentingUser' }, { landingUrl: '**/read' } );
	} );

	it( 'View the Reader stream', async function () {
		readerPage = new ReaderPage( page );
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

	it( 'Log in as test site owner', async function () {
		const loginPage = new LoginPage( page );
		await loginPage.login( { account: 'notificationsUser' } );
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
