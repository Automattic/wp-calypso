import {
	DataHelper,
	LoginFlow,
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
	const comment = DataHelper.getRandomPhrase();

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it( 'Log In', async function () {
		const loginFlow = new LoginFlow( page, 'commentingUser' );
		await loginFlow.logIn();
	} );

	it( 'View the Reader stream', async function () {
		readerPage = new ReaderPage( page );
	} );

	it( 'The latest post is on the expected test site', async function () {
		const testSiteForNotifications = DataHelper.config.get( 'testSiteForNotifications' );
		const siteOfLatestPost = await readerPage.siteOfLatestPost();
		expect( siteOfLatestPost ).toEqual( testSiteForNotifications );
	} );

	it( 'Comment on the latest post', async function () {
		await readerPage.commentOnLatestPost( comment );
	} );

	it( 'Wait for the comment to appear', async function () {
		await readerPage.waitForCommentToAppear( comment );
	} );

	it( 'Log in as test site owner', async function () {
		const loginFlow = new LoginFlow( page, 'notificationsUser' );
		await loginFlow.logIn();
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
