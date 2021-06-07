/**
 * External dependencies
 */
import {
	DataHelper,
	BrowserManager,
	LoginFlow,
	NewPostFlow,
	GutenbergEditorPage,
	MyHomePage,
	PublishedPostsListPage,
	PublishedPostPage,
} from '@automattic/calypso-e2e';

/**
 * Constants
 */
const quote =
	'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';
const user = 'gutenbergSimpleSiteUser';

describe( DataHelper.createSuiteTitle( 'Likes (Post)' ), function () {
<<<<<<< HEAD
	describe( 'Like a new post', function () {
		let publishedPostPage;
		let gutenbergEditorPage;

		it( 'Log in', async function () {
			const loginFlow = new LoginFlow( this.page, user );
			await loginFlow.login();
		} );

		it( 'Start new post', async function () {
			const newPostFlow = new NewPostFlow( this.page );
			await newPostFlow.newPostFromNavbar();
		} );

		it( 'Enter post title', async function () {
			gutenbergEditorPage = await GutenbergEditorPage.Expect( this.page );
			const title = DataHelper.randomPhrase();
			await gutenbergEditorPage.enterTitle( title );
		} );

		it( 'Enter post text', async function () {
			await gutenbergEditorPage.enterText( quote );
		} );

		it( 'Publish and visit post', async function () {
			await gutenbergEditorPage.publish( { visit: true } );
		} );

		it( 'Like post', async function () {
			publishedPostPage = await PublishedPostPage.Expect( this.page );
			await publishedPostPage.likePost();
		} );

		it( 'Unlike post', async function () {
			await publishedPostPage.unlikePost();
		} );
	} );
=======
	// describe( 'Like a new post', function () {
	// 	let postLikesComponent;
	// 	let gutenbergEditorPage;

	// 	it( 'Log in', async function () {
	// 		const loginFlow = new LoginFlow( this.page, user );
	// 		await loginFlow.login();
	// 	} );

	// 	it( 'Start new post', async function () {
	// 		const newPostFlow = new NewPostFlow( this.page );
	// 		await newPostFlow.newPostFromNavbar();
	// 	} );

	// 	it( 'Enter post title', async function () {
	// 		gutenbergEditorPage = await GutenbergEditorPage.Expect( this.page );
	// 		const title = DataHelper.randomPhrase();
	// 		await gutenbergEditorPage.enterTitle( title );
	// 	} );

	// 	it( 'Enter post text', async function () {
	// 		await gutenbergEditorPage.enterText( quote );
	// 	} );

	// 	it( 'Publish and visit post', async function () {
	// 		await gutenbergEditorPage.publish( { visit: true } );
	// 	} );

	// 	it( 'Like post', async function () {
	// 		postLikesComponent = await PostLikesComponent.Expect( this.page );
	// 		await postLikesComponent.clickLikePost();
	// 	} );

	// 	it( 'Unlike post', async function () {
	// 		await postLikesComponent.clickLikePost();
	// 	} );
	// } );
>>>>>>> f18a77707e (Remove page.waitForNavigation() from LoginPage.login() due to issues with loginFromPopUp() flow.)

	describe( 'Like an existing post', function () {
		let publishedPostPage;

		it( 'Log in', async function () {
			const loginFlow = new LoginFlow( this.page, user );
			await loginFlow.login();
		} );

		it( 'Visit site', async function () {
			const myHomePage = await MyHomePage.Expect( this.page );
			await myHomePage.visitSite();
		} );

		it( 'Click on first post', async function () {
			const publishedPostsListPage = await PublishedPostsListPage.Expect( this.page, user );
			await publishedPostsListPage.visitPost( 1 );
		} );

		it( 'Like post', async function () {
			publishedPostPage = await PublishedPostPage.Expect( this.page );
			await publishedPostPage.likePost();
		} );

		it( 'Unlike post', async function () {
			await publishedPostPage.unlikePost();
		} );

		it( 'Unlike post', async function () {
			await postLikesComponent.clickLikePost();
		} );
	} );

	describe( 'Like an existing post as logged out user', function () {
		let loginFlow;
		let postLikesComponent;
		let publishedPostsListPage;
		let url;

		before( 'Obtain test site URL', async function () {
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
			postLikesComponent = await PostLikesComponent.Expect( this.page );
			loginFlow = new LoginFlow( this.page, user );

			// Clicking the Like button will bring up a new popup, so
			// specifically call the flow for dealing with logging in from a popup.
			await Promise.all( [ loginFlow.loginFromPopup(), postLikesComponent.clickLikePost() ] );
		} );
	} );
} );
