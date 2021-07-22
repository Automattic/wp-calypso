import {
	setupHooks,
	BrowserManager,
	DataHelper,
	LoginFlow,
	PublishedPostsListPage,
	CommentsComponent,
	NavbarComponent,
	NotificationsComponent,
} from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'Notifications' ), function () {
	let page;
	let publishedPostsListPage;
	let notificationsComponent;

	const commentingUser = 'commentingUser';
	const notificationsUser = 'notificationsUser';
	const comment = DataHelper.randomPhrase() + ' TBD';

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it( `Log in as ${ commentingUser }`, async function () {
		const loginFlow = new LoginFlow( page, commentingUser );
		await loginFlow.logIn();
	} );

	it( 'View site', async function () {
		const siteURL = `https://${ DataHelper.getConfig( 'testSiteForNotifications' ) }`;
		await page.goto( siteURL );
		publishedPostsListPage = await PublishedPostsListPage.Expect( page );
	} );

	it( 'View first post', async function () {
		publishedPostsListPage.visitPost( 1 );
	} );

	it( 'Comment on the post', async function () {
		const commentsComponent = await CommentsComponent.Expect( page );
		await commentsComponent.postComment( comment );
	} );

	it( 'Clear cookies', async function () {
		await BrowserManager.clearCookies( page );
	} );

	it( `Log in as ${ notificationsUser }`, async function () {
		const loginFlow = new LoginFlow( page, notificationsUser );
		await loginFlow.logIn();
	} );

	it( 'Open notification using keyboard shortcut', async function () {
		const navbarComponent = await NavbarComponent.Expect( page );
		await navbarComponent.openNotificationsPanel( { keyboard: true } );
	} );

	it( `See notification for the comment left by ${ commentingUser }`, async function () {
		notificationsComponent = await NotificationsComponent.Expect( page );
		await notificationsComponent.clickNotification( comment );
	} );

	it( 'Delete comment from notification', async function () {
		await notificationsComponent.clickNotificationAction( 'Trash' );
	} );
} );
