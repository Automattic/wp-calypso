/**
 * @group gutenberg
 * @group calypso-pr
 * @group calypso-release
 */

import {
	DataHelper,
	ElementHelper,
	PublishedPostPage,
	TestAccount,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
	RestAPIClient,
	PostResponse,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( 'Likes: Post', function () {
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
	const otherUser = new TestAccount( 'defaultUser' );
	let page: Page;
	let restAPIClient: RestAPIClient;

	let newPost: PostResponse;

	beforeAll( async () => {
		page = await browser.newPage();
		await postingUser.authenticate( page );
	} );

	it( 'Setup the test', async function () {
		restAPIClient = new RestAPIClient( postingUser.credentials );
		newPost = await restAPIClient.createPost(
			postingUser.credentials.testSites?.primary.id as number,
			{
				title: DataHelper.getRandomPhrase(),
			}
		);
	} );

	describe( 'While authenticated', function () {
		let publishedPostPage: PublishedPostPage;

		it( 'View post', async function () {
			await ElementHelper.reloadAndRetry( page, async () => {
				await page.goto( newPost.URL, { timeout: 20 * 1000 } );
			} );
		} );

		it( 'Like post', async function () {
			await ElementHelper.reloadAndRetry( page, async () => {
				publishedPostPage = new PublishedPostPage( page );
				await publishedPostPage.likePost();
			} );
		} );

		it( 'Unlike post', async function () {
			await ElementHelper.reloadAndRetry( page, async () => {
				publishedPostPage = new PublishedPostPage( page );
				await publishedPostPage.unlikePost();
			} );
		} );
	} );

	describe( 'While unauthenticated', function () {
		let newPage: Page;
		let publishedPostPage: PublishedPostPage;

		beforeAll( async () => {
			newPage = await browser.newPage();
		} );

		it( 'Go to the published post page', async () => {
			await ElementHelper.reloadAndRetry( newPage, async () => {
				await newPage.goto( newPost.URL, { timeout: 20 * 1000 } );
			} );
		} );

		it( 'Login via popup to like the post', async function () {
			newPage.on( 'popup', async ( popup ) => {
				await otherUser.logInViaPopupPage( popup );
			} );

			publishedPostPage = new PublishedPostPage( newPage );
			await publishedPostPage.likePost();
		} );
	} );

	afterAll( async function () {
		if ( ! newPost ) {
			return;
		}

		await restAPIClient.deletePost(
			postingUser.credentials.testSites?.primary.id as number,
			newPost.ID
		);
	} );
} );
