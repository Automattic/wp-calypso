import {
	DataHelper,
	PostResponse,
	PublishedPostPage,
	RestAPIClient,
	TestAccount,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

/**
 * Tests liking and unliking posts while authenticated and unauthenticated.
 *
 * Keywords: Likes, Posts, Gutenberg
 */
test.describe(
	'Likes: Post',
	{ tag: [ tags.GUTENBERG, tags.CALYPSO_PR, tags.CALYPSO_RELEASE ] },
	() => {
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

		let postingUser: TestAccount;
		let restAPIClient: RestAPIClient;
		let newPost: PostResponse;

		test.beforeAll( async () => {
			postingUser = new TestAccount( accountName );
			restAPIClient = new RestAPIClient( postingUser.credentials );

			newPost = await restAPIClient.createPost(
				postingUser.credentials.testSites?.primary.id as number,
				{
					title: DataHelper.getRandomPhrase(),
				}
			);
		} );

		test.afterAll( async () => {
			if ( newPost ) {
				await restAPIClient.deletePost(
					postingUser.credentials.testSites?.primary.id as number,
					newPost.ID
				);
			}
		} );

		test( 'Like and unlike post while authenticated', async ( { page, helperElement } ) => {
			let publishedPostPage: PublishedPostPage;

			await test.step( `Given I am authenticated as '${ accountName }'`, async function () {
				await postingUser.authenticate( page );
			} );

			await test.step( 'When I view the published post', async function () {
				await helperElement.reloadAndRetry( page, async () => {
					await page.goto( newPost.URL, { timeout: 20 * 1000 } );
				} );
			} );

			await test.step( 'Then I see the post page', async function () {
				await expect( page ).toHaveURL( newPost.URL );
			} );

			await test.step( 'And I can like the post', async function () {
				await helperElement.reloadAndRetry( page, async () => {
					publishedPostPage = new PublishedPostPage( page );
					await publishedPostPage.likePost();
				} );
			} );

			await test.step( 'And I can unlike the post', async function () {
				await helperElement.reloadAndRetry( page, async () => {
					publishedPostPage = new PublishedPostPage( page );
					await publishedPostPage.unlikePost();
				} );
			} );
		} );

		test( 'Like post while unauthenticated via popup login', async ( {
			browser,
			helperElement,
			accountDefaultUser,
		} ) => {
			let publishedPostPage: PublishedPostPage;

			await test.step( 'Given I have an unauthenticated browser session', async function () {
				// This step is implicit - we're using a fresh page without authentication
			} );

			const newPage = await browser.newPage();

			await test.step( 'When I navigate to the published post', async function () {
				await helperElement.reloadAndRetry( newPage, async () => {
					await newPage.goto( newPost.URL, { timeout: 20 * 1000 } );
				} );
			} );

			await test.step( 'Then I see the post page', async function () {
				await expect( newPage ).toHaveURL( newPost.URL );
			} );

			await test.step( 'And I can like the post by logging in via a popup', async function () {
				newPage.on( 'popup', async ( popup ) => {
					await accountDefaultUser.logInViaPopupPage( popup );
				} );

				publishedPostPage = new PublishedPostPage( newPage );
				await publishedPostPage.likePost();
			} );

			await newPage.close();
		} );
	}
);
