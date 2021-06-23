/**
 * External dependencies
 */
import {
	DataHelper,
	LoginFlow,
	NewPostFlow,
	GutenbergEditorPage,
	PublishedPostPage,
} from '@automattic/calypso-e2e';

/**
 * Constants
 */
const quote =
	'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';

describe( DataHelper.createSuiteTitle( 'Likes (Post)' ), function () {
	let postUrl;

	describe( 'Create and like a new post', function () {
		let publishedPostPage;
		let gutenbergEditorPage;

		it( 'Log in', async function () {
			const loginFlow = new LoginFlow( this.page, 'gutenbergSimpleSiteUser' );
			await loginFlow.logIn();
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
			postUrl = await gutenbergEditorPage.publish( { visit: true, getUrl: true } );
		} );

		it( 'Like post', async function () {
			publishedPostPage = await PublishedPostPage.Expect( this.page );
			await publishedPostPage.likePost();
		} );

		it( 'Unlike post', async function () {
			await publishedPostPage.unlikePost();
		} );
	} );

	describe( 'Like an existing post as non-author', function () {
		let publishedPostPage;

		it( 'Log in', async function () {
			const loginFlow = new LoginFlow( this.page );
			await loginFlow.logIn();
		} );

		it( 'Visit post', async function () {
			// Raw call to the Page object.
			await this.page.goto( postUrl );
		} );

		it( 'Like post', async function () {
			publishedPostPage = await PublishedPostPage.Expect( this.page );
			await publishedPostPage.likePost();
		} );

		it( 'Unlike post', async function () {
			await publishedPostPage.unlikePost();
		} );
	} );
} );
