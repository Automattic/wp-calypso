/**
 * @group gutenberg
 */

import {
	DataHelper,
	EditorPage,
	PublishedPostPage,
	TestAccount,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

/**
 * Constants
 */
const quote =
	'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';

describe( DataHelper.createSuiteTitle( 'Likes (Post)' ), function () {
	const features = envToFeatureKey( envVariables );
	// @todo Does it make sense to create a `simpleSitePersonalPlanUserEdge` with GB edge?
	// for now, it will pick up the default `gutenbergAtomicSiteEdgeUser` if edge is set.
	const accountName = getTestAccountByFeature( features, [
		{
			gutenberg: 'stable',
			siteType: 'simple',
			accountName: 'simpleSitePersonalPlanUser',
		},
	] );

	const postingUser = new TestAccount( accountName );
	const likeUser = new TestAccount( 'defaultUser' );
	let page: Page;
	let publishedURL: URL;
	let publishedPostPage: PublishedPostPage;

	describe( 'As the posting user', function () {
		let editorPage: EditorPage;

		beforeAll( async () => {
			page = await browser.newPage();
			editorPage = new EditorPage( page, { target: features.siteType } );
			await postingUser.authenticate( page );
		} );

		it( 'Go to the new post page', async function () {
			await editorPage.visit( 'post' );
		} );

		it( 'Enter post title', async function () {
			const title = DataHelper.getRandomPhrase();
			await editorPage.enterTitle( title );
		} );

		it( 'Enter post text', async function () {
			await editorPage.enterText( quote );
		} );

		it( 'Publish and visit post', async function () {
			publishedURL = await editorPage.publish( { visit: true } );
		} );

		it( 'Like post', async function () {
			publishedPostPage = new PublishedPostPage( page );
			await publishedPostPage.likePost();
		} );

		it( 'Unlike post', async function () {
			await publishedPostPage.unlikePost();
		} );
	} );

	describe( 'As the liking user', function () {
		beforeAll( async () => {
			page = await browser.newPage();
		} );

		it( 'Go to the published post page', async () => {
			await page.goto( publishedURL.href );
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
