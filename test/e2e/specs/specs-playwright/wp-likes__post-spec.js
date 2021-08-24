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

/**
 * Constants
 */
const quote =
	'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';

describe( DataHelper.createSuiteTitle( 'Likes (Post)' ), function () {
	let page;
	const mainUser = 'gutenbergSimpleSiteUser';
	const anotherUser = 'defaultUser';

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( 'Like a new post', function () {
		let publishedPostPage;
		let gutenbergEditorPage;
		let publishedURL;

		it( 'Log in', async function () {
			const loginFlow = new LoginFlow( page, mainUser );
			await loginFlow.logIn();
		} );

		it( 'Start new post', async function () {
			const newPostFlow = new NewPostFlow( page );
			await newPostFlow.newPostFromNavbar();
		} );

		it( 'Enter post title', async function () {
			gutenbergEditorPage = new GutenbergEditorPage( page );
			const title = DataHelper.getRandomPhrase();
			await gutenbergEditorPage.enterTitle( title );
		} );

		it( 'Enter post text', async function () {
			await gutenbergEditorPage.enterText( quote );
		} );

		it( 'Publish and visit post', async function () {
			publishedURL = await gutenbergEditorPage.publish( { visit: true } );
			assert.strictEqual( publishedURL, await page.url() );
		} );

		it( 'Like post', async function () {
			publishedPostPage = new PublishedPostPage( page );
			await publishedPostPage.likePost();
		} );

		it( 'Unlike post', async function () {
			await publishedPostPage.unlikePost();
		} );

		it( 'Clear cookies', async function () {
			await BrowserManager.clearAuthenticationState( page );
		} );

		it( `Like post as ${ anotherUser }`, async function () {
			publishedPostPage = new PublishedPostPage( page );

			const loginFlow = new LoginFlow( page, anotherUser );

			// Clicking the Like button will bring up a new popup.
			// `loginFromPopup` will observe for a popup event, grab the new popup and
			// execute the login process on that page.
			await Promise.all( [ loginFlow.logInFromPopup(), publishedPostPage.likePost() ] );
		} );
	} );
} );
