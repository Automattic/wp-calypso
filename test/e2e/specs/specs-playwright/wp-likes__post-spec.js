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

<<<<<<< HEAD
describe( DataHelper.createSuiteTitle( 'Likes' ), function () {
	describe( 'New post', function () {
		let gutenbergEditorPage;
		let likesComponent;
=======
describe( `[${ host }] Likes (Post): (${ viewportName }) @parallel`, function () {
	this.timeout( mochaTimeOut );

	let postLikesComponent;
>>>>>>> 5e61b22aa5 (Remove console.log and update JSDoc on CommentLikesComponent.)

	describe( 'New post', function () {
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

		it( 'Like post', async function () {
			postLikesComponent = await PostLikesComponent.Expect( this.page );
			await postLikesComponent.clickLikePost();
		} );

		it( 'Unlike post', async function () {
			await postLikesComponent.clickLikePost();
		} );
	} );

	describe( 'Existing post', function () {
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

		it( 'Like post', async function () {
			await postLikesComponent.clickLikePost();
		} );
	} );
} );
