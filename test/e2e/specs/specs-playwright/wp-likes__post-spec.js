/**
 * External dependencies
 */
import {
	DataHelper,
	LoginFlow,
	NewPostFlow,
	GutenbergEditorPage,
	PostLikesComponent,
	MyHomePage,
	PublishedPostsListPage,
} from '@automattic/calypso-e2e';

/**
 * Constants
 */
const quote =
	'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';
const user = 'gutenbergSimpleSiteUser';

describe( DataHelper.createSuiteTitle( 'Likes (Post)' ), function () {
	describe( 'Like a new post', function () {
		let postLikesComponent;
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
			postLikesComponent = await PostLikesComponent.Expect( this.page );
			await postLikesComponent.clickLikePost();
		} );

		it( 'Unlike post', async function () {
			await postLikesComponent.clickLikePost();
		} );
	} );

	describe( 'Like an existing post', function () {
		let postLikesComponent;

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
			postLikesComponent = await PostLikesComponent.Expect( this.page );
			await postLikesComponent.clickLikePost();
		} );

		it( 'Unlike post', async function () {
			await postLikesComponent.clickLikePost();
		} );
	} );
} );
