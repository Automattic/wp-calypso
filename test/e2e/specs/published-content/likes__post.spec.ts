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

		test( 'As a user, I can like and unlike a post while authenticated', async ( { page } ) => {
			await test.step( 'Authenticate and setup the test', async () => {
				await postingUser.authenticate( page );
				restAPIClient = new RestAPIClient( postingUser.credentials );
				otherUserRestAPIClient = new RestAPIClient( otherUser.credentials );
				const siteID = postingUser.credentials.testSites?.primary.id as number;

				newPost = await restAPIClient.createPost( siteID, {
					title: DataHelper.getRandomPhrase(),
				} );

				// Ensure neither user has a stale "liked" state on the post.
				await Promise.allSettled( [
					restAPIClient.postLikeAction( 'unlike', siteID, newPost.ID ),
					otherUserRestAPIClient.postLikeAction( 'unlike', siteID, newPost.ID ),
				] );
			} );

			let publishedPostPage: PublishedPostPage;

			await test.step( 'View post', async () => {
				await ElementHelper.reloadAndRetry( page, async () => {
					await page.goto( newPost.URL, { timeout: 20 * 1000 } );
				} );
			} );

			await test.step( 'Like post', async () => {
				await ElementHelper.reloadAndRetry( page, async () => {
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
		} );

		test( 'As an unauthenticated user, I can like a post via popup login', async ( { page } ) => {
			await test.step( 'Create new incognito context', async () => {
				// Skip if post wasn't created yet (test ordering).
				if ( ! newPost ) {
					test.skip();
				}
			} );

			const newContext = await page.context().browser()!.newContext();
			const newPage = await newContext.newPage();

			await test.step( 'Go to the published post page', async () => {
				await ElementHelper.reloadAndRetry( newPage, async () => {
					await newPage.goto( newPost.URL, { timeout: 20 * 1000 } );
				} );
			} );

			await test.step( 'Login via popup to like the post', async () => {
				newPage.on( 'popup', async ( popup ) => {
					await otherUser.logInViaPopupPage( popup );
				} );

				const publishedPostPage = new PublishedPostPage( newPage );
				await publishedPostPage.likePost();
			} );

			await newContext.close();
		} );
	}
);
