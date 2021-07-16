import assert from 'assert';
import {
	DataHelper,
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
	let postURL;

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
			const publishedURL = await gutenbergEditorPage.publish( { visit: true } );
			assert.strictEqual( await page.url(), publishedURL );
		} );

		it( 'Like post', async function () {
			publishedPostPage = await PublishedPostPage.Expect( page );
		} );

		it( 'Like post', async function () {
			await publishedPostPage.likePost();
		} );

		it( 'Unlike post', async function () {
			await publishedPostPage.unlikePost();
		} );
	} );
} );
