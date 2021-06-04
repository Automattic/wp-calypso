/**
 * External dependencies
 */
import {
	DataHelper,
	LoginFlow,
	MyHomePage,
	PublishedPostsListPage,
	CommentsComponent,
	CommentsLikesComponent,
	GutenbergEditorPage,
	NewPostFlow,
} from '@automattic/calypso-e2e';

/**
 * Constants
 */
const quote =
	'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';

describe( DataHelper.createSuiteTitle( 'Likes (Comment) ' ), function () {
	describe( 'Comment and like on an existing post', function () {
		let commentsLikesComponent;

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
		} );

		it( 'Post a comment', async function () {
			const comment = DataHelper.randomPhrase();
			const commentsComponent = await CommentsComponent.Expect( this.page );
			await commentsComponent.postComment( comment );
		} );

		it( 'Like a comment', async function () {
			commentsLikesComponent = await CommentsLikesComponent.Expect( this.page );
			await commentsLikesComponent.clickLikeComment( 1 );
		} );
	} );

	describe( 'Comment and like on a new post', function () {
		let commentsLikesComponent;
		let gutenbergEditorPage;

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
		} );

		it( 'Post a comment', async function () {
			const comment = DataHelper.randomPhrase();
			const commentsComponent = await CommentsComponent.Expect( this.page );
			await commentsComponent.postComment( comment );
		} );

		it( 'Like a comment', async function () {
			commentsLikesComponent = await CommentsLikesComponent.Expect( this.page );
			await commentsLikesComponent.clickLikeComment( 1 );
		} );

		it( 'Unlike a comment', async function () {
			await commentsLikesComponent.clickLikeComment( 1 );
		} );
	} );
} );
