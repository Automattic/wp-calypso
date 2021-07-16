import assert from 'assert';
import {
	DataHelper,
	BrowserManager,
	LoginFlow,
	NewPostFlow,
	GutenbergEditorPage,
	PublishedPostPage,
	setupHooks,
} from '@automattic/calypso-e2e';

const quote =
	'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';

describe( DataHelper.createSuiteTitle( 'Likes (Post)' ), function () {
	let page;
	let publishedURL;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( 'Like a new post', function () {
		let publishedPostPage;
		let gutenbergEditorPage;

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
			assert.strictEqual( await page.url(), publishedURL );
			publishedPostPage = await PublishedPostPage.Expect( page );
		} );

		it( 'Like post', async function () {
			await publishedPostPage.likePost();
		} );

		it( 'Unlike post', async function () {
			await publishedPostPage.unlikePost();
		} );
	} );

	describe( 'Like an existing post as logged out user', function () {
		let loginFlow;
		let publishedPostPage;

		it( 'Set up', async function () {
			await page.pause();
			await BrowserManager.clearCookies( page );
		} );

		it( 'Visit site', async function () {
			// This is a raw call to the underlying page as it does not warrant creating
			// an entire flow or page for this one action.
			await page.goto( publishedURL );
		} );

		it( 'Like post as logged out user and confirm post is liked', async function () {
			publishedPostPage = await PublishedPostPage.Expect( page );
			loginFlow = new LoginFlow( page, 'gutenbergSimpleSiteUser' );

			// Clicking the Like button will bring up a new popup, so
			// specifically call the flow for dealing with logging in from a popup.
			await Promise.all( [ loginFlow.logInFromPopup(), publishedPostPage.likePost() ] );
		} );

		it( 'Unlike post', async function () {
			await publishedPostPage.unlikePost();
		} );
	} );
} );
