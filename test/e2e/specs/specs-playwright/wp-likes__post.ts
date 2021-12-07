/**
 * @group gutenberg
 * @group calypso-pr
 */

import assert from 'assert';
import {
	DataHelper,
	BrowserManager,
	LoginPage,
	NewPostFlow,
	GutenbergEditorPage,
	PublishedPostPage,
	setupHooks,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

/**
 * Constants
 */
const quote =
	'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';

describe( DataHelper.createSuiteTitle( 'Likes (Post)' ), function () {
	let page: Page;

	const postingUser = 'simpleSitePersonalPlanUser';
	const likeUser = 'defaultUser';

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( 'Like a new post', function () {
		let publishedPostPage: PublishedPostPage;
		let gutenbergEditorPage: GutenbergEditorPage;
		let publishedURL;

		it( 'Log in', async function () {
			const loginPage = new LoginPage( page );
			await loginPage.login( { account: postingUser } );
		} );

		it( 'Start new post', async function () {
			const newPostFlow = new NewPostFlow( page );
			await newPostFlow.newPostFromNavbar();
		} );

		it( 'Enter post title', async function () {
			gutenbergEditorPage = new GutenbergEditorPage( page );
			const title = DataHelper.getRandomPhrase();
			await gutenbergEditorPage.enterTitle( title );
		} );

		it( 'Enter post text', async function () {
			await gutenbergEditorPage.enterText( quote );
		} );

		it( 'Publish and visit post', async function () {
			publishedURL = await gutenbergEditorPage.publish( { visit: true } );
			assert.strictEqual( publishedURL, await page.url() );
		} );

		it( 'Like post', async function () {
			publishedPostPage = new PublishedPostPage( page );
			await publishedPostPage.likePost();
		} );

		it( 'Unlike post', async function () {
			await publishedPostPage.unlikePost();
		} );

		it( 'Clear cookies', async function () {
			await BrowserManager.clearAuthenticationState( page );
		} );

		it( `Like post as ${ likeUser }`, async function () {
			publishedPostPage = new PublishedPostPage( page );

			// Clicking the Like button will bring up a new popup.
			// Observe for the new popup in the Promise. Once the Page object
			// is obtained, execute login steps there and wait for the
			// popup to close.
			await Promise.all( [
				page.on( 'popup', async ( popup ) => {
					const loginPage = new LoginPage( popup );
					await loginPage.loginFromPopup( { account: likeUser } );
					await popup.waitForEvent( 'close' );
				} ),
				publishedPostPage.likePost(),
			] );
		} );
	} );
} );
