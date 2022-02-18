/**
 * @group gutenberg
 */

import {
	DataHelper,
	GutenbergEditorPage,
	PublishedPostPage,
	TestAccount,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

/**
 * Constants
 */
const quote =
	'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';

describe( DataHelper.createSuiteTitle( 'Likes (Post)' ), function () {
	const postingUser = new TestAccount( 'simpleSitePersonalPlanUser' );
	const likeUser = new TestAccount( 'defaultUser' );
	let page: Page;
	let publishedURL: string;
	let publishedPostPage: PublishedPostPage;

	describe( 'As the posting user', function () {
		let gutenbergEditorPage: GutenbergEditorPage;

		beforeAll( async () => {
			page = await browser.newPage();
			gutenbergEditorPage = new GutenbergEditorPage( page );
			await postingUser.authenticate( page );
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
			page = await browser.newPage();
		} );

		it( 'Go to the published post page', async () => {
			await page.goto( publishedURL );
		} );

		it( 'Login via popup to like the post', async function () {
			page.on( 'popup', async ( popup ) => {
				await likeUser.logInViaPopupPage( popup );
			} );

			publishedPostPage = new PublishedPostPage( page );
			await publishedPostPage.likePost();
		} );
	} );
} );
