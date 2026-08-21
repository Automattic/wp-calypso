import {
	DataHelper,
	ElementHelper,
	PostResponse,
	PublishedPostPage,
	RestAPIClient,
	TestAccount,
	envVariables,
	envToFeatureKey,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

test.describe(
	'Likes: Post',
	{ tag: [ tags.GUTENBERG, tags.CALYPSO_PR, tags.CALYPSO_RELEASE ] },
	() => {
		const features = envToFeatureKey( envVariables );
		const accountName = getTestAccountByFeature( features, [
			{
				gutenberg: 'stable',
				siteType: 'simple',
				accountName: 'simpleSitePersonalPlanUser',
			},
		] );

		const postingUser = new TestAccount( accountName );
		const otherUser = new TestAccount( 'defaultUser' );
		let newPost: PostResponse;
		let restAPIClient: RestAPIClient;
		let otherUserRestAPIClient: RestAPIClient;

		test.afterAll( async () => {
			if ( ! newPost ) {
				return;
			}
			await restAPIClient.deletePost(
				postingUser.credentials.testSites?.primary.id as number,
				newPost.ID
			);
		} );

		// Both flows act on the same post and must run in order; under the
		// config's fullyParallel mode separate tests land in separate workers,
		// where module state does not carry over and afterAll runs per worker.
		// A single test keeps the ordering and gives cleanup one owner.
		test( 'As a user, I can like and unlike a post, and another user can like it after logging in via popup', async ( {
			page,
			browser,
		} ) => {
			test.setTimeout( 240 * 1000 );

			let siteID: number;
			let publishedPostPage: PublishedPostPage;

			await test.step( 'Authenticate and setup the test', async () => {
				await postingUser.authenticate( page );
				restAPIClient = new RestAPIClient( postingUser.credentials );
				otherUserRestAPIClient = new RestAPIClient( otherUser.credentials );
				siteID = postingUser.credentials.testSites?.primary.id as number;

				newPost = await restAPIClient.createPost( siteID, {
					title: DataHelper.getRandomPhrase(),
				} );

				// Ensure neither user has a stale "liked" state on the post.
				await Promise.allSettled( [
					restAPIClient.postLikeAction( 'unlike', siteID, newPost.ID ),
					otherUserRestAPIClient.postLikeAction( 'unlike', siteID, newPost.ID ),
				] );
			} );

			await test.step( 'View post', async () => {
				await ElementHelper.reloadAndRetry( page, async () => {
					await page.goto( newPost.URL, { timeout: 20 * 1000 } );
				} );
			} );

			await test.step( 'Like post', async () => {
				await ElementHelper.reloadAndRetry( page, async () => {
					// Reset like state via REST API before each attempt.
					await restAPIClient.postLikeAction( 'unlike', siteID, newPost.ID );
					await page.reload();
					publishedPostPage = new PublishedPostPage( page );
					await publishedPostPage.likePost();
				} );
			} );

			await test.step( 'Unlike post', async () => {
				await ElementHelper.reloadAndRetry( page, async () => {
					publishedPostPage = new PublishedPostPage( page );
					await publishedPostPage.unlikePost();
				} );
			} );

			// Logged-out visitor in a fresh context, liking via popup login.
			const newContext = await browser.newContext();
			const newPage = await newContext.newPage();

			await test.step( 'Go to the published post page', async () => {
				await ElementHelper.reloadAndRetry( newPage, async () => {
					await newPage.goto( newPost.URL, { timeout: 20 * 1000 } );
				} );
			} );

			await test.step( 'Login via popup to like the post', async () => {
				const loggedOutPostPage = new PublishedPostPage( newPage );
				await loggedOutPostPage.likePost( {
					handleLoginPopup: ( popup ) => otherUser.logInViaPopupPage( popup ),
				} );
			} );

			await newContext.close();
		} );
	}
);
