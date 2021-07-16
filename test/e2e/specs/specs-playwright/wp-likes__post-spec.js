import {
	DataHelper,
	BrowserManager,
	LoginFlow,
	NewPostFlow,
	GutenbergEditorPage,
	PublishedPostPage,
	setupHooks,
} from '@automattic/calypso-e2e';

/**
 * Constants
 */
const quote =
	'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';

describe( DataHelper.createSuiteTitle( 'Likes (Post)' ), function () {
	let page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( 'Like a new post', function () {
		let publishedPostPage;
		let gutenbergEditorPage;
		let publishedURL;

		it( 'Log in', async function () {
			const loginFlow = new LoginFlow( page, 'gutenbergSimpleSiteUser' );
			await loginFlow.logIn();
		} );

		it( 'Start new post', async function () {
			const newPostFlow = new NewPostFlow( page );
			await newPostFlow.newPostFromNavbar();
		} );

		it( 'Enter post title', async function () {
			gutenbergEditorPage = await GutenbergEditorPage.Expect( page );
			const title = DataHelper.randomPhrase();
			await gutenbergEditorPage.enterTitle( title );
		} );

		it( 'Enter post text', async function () {
			await gutenbergEditorPage.enterText( quote );
		} );

		it( 'Publish and visit post', async function () {
			publishedURL = await gutenbergEditorPage.publish( { visit: true } );
		} );

		it( 'Like post', async function () {
			publishedPostPage = await PublishedPostPage.Expect( page );
			await publishedPostPage.likePost();
		} );

		it( 'Unlike post', async function () {
			await publishedPostPage.unlikePost();
		} );

		it( 'Clear cookies', async function () {
			await BrowserManager.clearCookies( page, publishedURL );
		} );

		it( 'Like post as another user', async function () {
			publishedPostPage = await PublishedPostPage.Expect( page );

			// await Promise.all( [
			// 	page.on( 'popup', async ( popupPage ) => {
			// 		const loginFlow = new LoginFlow( popupPage, 'defaultUser' );
			// 		await loginFlow.logIn();
			// 		await popupPage.waitForEvent( 'close' );
			// 	} ),
			// 	publishedPostPage.likePost(),
			// ] );

			const loginFlow = new LoginFlow( page, 'defaultUser' );

			// Clicking the Like button will bring up a new popup, so
			// specifically call the flow for dealing with logging in from a popup.
			await Promise.all( [ loginFlow.logInFromPopup(), publishedPostPage.likePost() ] );
		} );
	} );
} );
