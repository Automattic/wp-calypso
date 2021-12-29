/**
 * @group gutenberg
 */

import {
	DataHelper,
	GutenbergEditorPage,
	PublishedPostPage,
	setupHooks,
	TestAccount,
} from '@automattic/calypso-e2e';

/**
 * Constants
 */
const quote =
	'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';

describe( DataHelper.createSuiteTitle( 'Likes (Post)' ), function () {
	const postingUser = 'simpleSitePersonalPlanUser';
	const likeUser = 'defaultUser';
	let page;
	let publishedURL;
	let publishedPostPage;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( 'As the posting user', function () {
		let testAccount;
		let gutenbergEditorPage;

		beforeAll( async () => {
			gutenbergEditorPage = new GutenbergEditorPage( page );
			testAccount = new TestAccount( postingUser );
			await testAccount.authenticate( page );
		} );

		afterAll( async () => {
			await testAccount.clearAuthenticationState( page );
		} );

		it( 'Go to the new post page', async function () {
			await gutenbergEditorPage.visit( 'post' );
		} );

		it( 'Enter post title', async function () {
			const title = DataHelper.getRandomPhrase();
			await gutenbergEditorPage.enterTitle( title );
		} );

		it( 'Enter post text', async function () {
			await gutenbergEditorPage.enterText( quote );
		} );

		it( 'Publish and visit post', async function () {
			publishedURL = await gutenbergEditorPage.publish( { visit: true } );
		} );

		it( 'Like post', async function () {
			publishedPostPage = new PublishedPostPage( page );
			await publishedPostPage.likePost();
		} );

		it( 'Unlike post', async function () {
			await publishedPostPage.unlikePost();
		} );
	} );

	describe( 'As the liking user', () => {
		beforeAll( async () => {
			const testAccount = new TestAccount( likeUser );
			await testAccount.authenticate( page );
		} );

		it( 'Go to the published post page', async () => {
			await page.goto( publishedURL );
		} );

		it( `Like post as ${ likeUser }`, async function () {
			publishedPostPage = new PublishedPostPage( page );
			await publishedPostPage.likePost();
		} );
	} );
} );
