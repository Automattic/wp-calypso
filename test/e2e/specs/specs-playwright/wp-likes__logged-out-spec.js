/**
 * External dependencies
 */
import {
	DataHelper,
	BrowserManager,
	LoginFlow,
	NewPostFlow,
	PublishedPostPage,
} from '@automattic/calypso-e2e';

/**
 * Constants
 */
const user = 'gutenbergSimpleSiteUser';

describe( DataHelper.createSuiteTitle( 'Likes (Logged Out)' ), function () {
	describe( 'Like an existing post as logged out user', function () {
		let loginFlow;
		let publishedPostPage;
		let postUrl;

		before( 'Set up', async function () {
			// Log In, write then publish a new post and save the post URL.
			// This is done as the default user.
			loginFlow = new LoginFlow( this.page );
			await loginFlow.logIn();
			const newPostFlow = new NewPostFlow( this.page );
			postUrl = await newPostFlow.getNewTestPost();
			// Clear the cookies for user.
			await BrowserManager.clearCookies( this.page );
		} );

		it( 'Visit post', async function () {
			// This is a raw call to the underlying page as it does not warrant creating
			// an entire flow or page for this one action.
			await this.page.goto( postUrl );
		} );

		it( 'Like post', async function () {
			// Upon navigation conclusion, the published post should be on screen.
			publishedPostPage = await PublishedPostPage.Expect( this.page );

			// Prepare to execute a new log in flow as the specified user.
			loginFlow = new LoginFlow( this.page, user );

			// Clicking the Like button will bring up a new popup, so
			// specifically call the flow for dealing with logging in from a popup.
			await Promise.all( [ loginFlow.logInFromPopup(), publishedPostPage.likePost() ] );
		} );

		it( 'Unlike post', async function () {
			await publishedPostPage.unlikePost();
		} );
	} );
} );
