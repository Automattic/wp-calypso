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
	const comment = DataHelper.randomPhrase();

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it( 'Log In', async function () {
		const loginFlow = new LoginFlow( page, 'commentingUser' );
		await loginFlow.logIn();
	} );

	it( 'Can see the Reader stream', async function () {
		readerPage = new ReaderPage( page );
	} );

	it( 'The latest post is on the expected test site', async function () {
		const testSiteForNotifications = DataHelper.config.get( 'testSiteForNotifications' );
		readerPage = new ReaderPage( page );
		const siteOfLatestPost = await readerPage.siteOfLatestPost();
		expect( siteOfLatestPost ).toEqual( testSiteForNotifications );
	} );

	it( 'Can comment on the latest post and see the comment appear', async function () {
		readerPage = new ReaderPage( page );
		await readerPage.commentOnLatestPost( comment );
		await readerPage.waitForCommentToAppear( comment );
	} );

	it( 'Can log in as test site owner', async function () {
		const loginFlow = new LoginFlow( page, 'notificationsUser' );
		await loginFlow.logIn();
	} );

	it( 'Can delete the new comment (and wait for UNDO grace period so step is actually deleted)', async function () {
		const navBarComponent = new NavbarComponent( page );
		await navBarComponent.openNotificationsPanel();
		const notificationsComponent = new NotificationsComponent( page );
		await notificationsComponent.clickNotification( comment );
		await notificationsComponent.clickNotificationAction( 'Trash' );
		await notificationsComponent.waitForUndoMessage();
		await notificationsComponent.waitForUndoMessageToDisappear();
	} );
} );
