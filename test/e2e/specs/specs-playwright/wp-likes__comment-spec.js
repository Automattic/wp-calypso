/**
 * External dependencies
 */
import {
	DataHelper,
	LoginFlow,
	MyHomePage,
	PublishedPostsListPage,
	CommentsComponent,
	GutenbergEditorPage,
	NewPostFlow,
	PublishedPostPage,
} from '@automattic/calypso-e2e';

/**
 * Constants
 */
const quote =
	'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';

describe( DataHelper.createSuiteTitle( 'Likes (Comment) ' ), function () {
	describe( 'Comment and like on an existing post', function () {
		let commentsComponent;
		const comment = DataHelper.randomPhrase();

		it( 'Log in', async function () {
			const loginFlow = new LoginFlow( this.page, 'gutenbergSimpleSiteUser' );
			await loginFlow.login();
		} );

		it( 'Visit site', async function () {
			const myHomePage = await MyHomePage.Expect( this.page );
			await myHomePage.visitSite();
		} );

		it( 'Click on first post', async function () {
			const publishedPostsListPage = await PublishedPostsListPage.Expect( this.page );
			await publishedPostsListPage.visitPost( 1 );
			await PublishedPostPage.Expect( this.page );
		} );

		it( 'Post a comment', async function () {
			commentsComponent = await CommentsComponent.Expect( this.page );
			await commentsComponent.postComment( comment );
		} );

		it( 'Like the comment', async function () {
			await commentsComponent.like( comment );
		} );

		it( 'Unlike the comment', async function () {
			await commentsComponent.unlike( comment );
		} );
	} );

	describe( 'Comment and like on a new post', function () {
		let commentsComponent;
		let gutenbergEditorPage;
		const comment = DataHelper.randomPhrase();

		it( 'Log in', async function () {
			const loginFlow = new LoginFlow( this.page, 'gutenbergSimpleSiteUser' );
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
			await PublishedPostPage.Expect( this.page );
		} );

		it( 'Post a comment', async function () {
			commentsComponent = await CommentsComponent.Expect( this.page );
			await commentsComponent.postComment( comment );
		} );

		it( 'Like the comment', async function () {
			await commentsComponent.like( comment );
		} );

		it( 'Unlike the comment', async function () {
			await commentsComponent.unlike( comment );
		} );
	} );
} );
