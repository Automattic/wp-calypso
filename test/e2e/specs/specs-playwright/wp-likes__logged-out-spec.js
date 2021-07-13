import {
	DataHelper,
	BrowserManager,
	LoginFlow,
	PublishedPostPage,
	PublishedPostsListPage,
} from '@automattic/calypso-e2e';

/**
 * Constants
 */
const user = 'gutenbergSimpleSiteUser';

describe( DataHelper.createSuiteTitle( 'Likes (Logged Out)' ), function () {
	describe( 'Like an existing post as logged out user', function () {
		let loginFlow;
		let publishedPostPage;
		let publishedPostsListPage;
		let url;

		it( 'Set up', async function () {
			url = DataHelper.getAccountSiteURL( user );
			await BrowserManager.clearCookies( this.page );
		} );

		it( 'Visit site', async function () {
			// This is a raw call to the underlying page as it does not warrant creating
			// an entire flow or page for this one action.
			await this.page.goto( url );
		} );

		it( 'Click on first post', async function () {
			publishedPostsListPage = await PublishedPostsListPage.Expect( this.page, user );
			await publishedPostsListPage.visitPost( 1 );
		} );

		it( 'Like post', async function () {
			publishedPostPage = await PublishedPostPage.Expect( this.page );
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
