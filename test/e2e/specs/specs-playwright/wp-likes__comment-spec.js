/**
 * @group gutenberg
 */

import assert from 'assert';
import {
	DataHelper,
	LoginPage,
	CommentsComponent,
	GutenbergEditorPage,
	NewPostFlow,
	setupHooks,
} from '@automattic/calypso-e2e';

const quote =
	'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';

describe( DataHelper.createSuiteTitle( 'Likes (Comment) ' ), function () {
	let page;
	let publishedURL;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( 'Comment and like on a new post', function () {
		let commentsComponent;
		let gutenbergEditorPage;
		const comment = DataHelper.getRandomPhrase();

		it( 'Log in', async function () {
			const loginPage = new LoginPage( page );
			await loginPage.login( { account: 'simpleSitePersonalPlanUser' } );
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

		it( 'Post a comment', async function () {
			commentsComponent = new CommentsComponent( page );
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
