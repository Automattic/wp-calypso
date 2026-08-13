import {
	CommentsComponent,
	DataHelper,
	NewCommentResponse,
	PostResponse,
	RestAPIClient,
	TestAccount,
	envVariables,
	envToFeatureKey,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

test.describe( 'Likes: Comment', { tag: [ tags.GUTENBERG ] }, () => {
	const features = envToFeatureKey( envVariables );
	const accountName = getTestAccountByFeature( features, [
		{
			gutenberg: 'stable',
			siteType: 'simple',
			accountName: 'simpleSitePersonalPlanUser',
		},
	] );
	let newPost: PostResponse;
	let restAPIClient: RestAPIClient;
	let testAccount: TestAccount;

	test.afterAll( async () => {
		if ( ! newPost ) {
			return;
		}
		await restAPIClient.deletePost(
			testAccount.credentials.testSites?.primary.id as number,
			newPost.ID
		);
	} );

	test( 'As a user, I can like and unlike a comment', async ( { page } ) => {
		testAccount = new TestAccount( accountName );
		restAPIClient = new RestAPIClient( testAccount.credentials );
		let commentToBeLiked: NewCommentResponse;
		let commentToBeUnliked: NewCommentResponse;

		await test.step( 'Setup the test', async () => {
			const postContent =
				'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';

			newPost = await restAPIClient.createPost(
				testAccount.credentials.testSites?.primary.id as number,
				{
					title: DataHelper.getTimestamp() as string,
					content: postContent,
				}
			);

			commentToBeLiked = await restAPIClient.createComment(
				testAccount.credentials.testSites?.primary.id as number,
				newPost.ID,
				DataHelper.getRandomPhrase()
			);
			commentToBeUnliked = await restAPIClient.createComment(
				testAccount.credentials.testSites?.primary.id as number,
				newPost.ID,
				DataHelper.getRandomPhrase()
			);

			// The comment takes some time to settle. Retry to handle `unknown_comment` errors.
			const likeRetryCount = 10;
			for ( let i = 0; i <= likeRetryCount; i++ ) {
				try {
					await restAPIClient.commentAction(
						'like',
						testAccount.credentials.testSites?.primary.id as number,
						commentToBeUnliked.ID
					);
					break;
				} catch ( error ) {
					if ( i === likeRetryCount ) {
						throw error;
					}
					await page.waitForTimeout( 1000 );
				}
			}

			await testAccount.authenticate( page );
		} );

		await test.step( 'View the post', async () => {
			await page.goto( newPost.URL );
		} );

		const commentsComponent = new CommentsComponent( page );

		await test.step( 'Like the comment', async () => {
			await commentsComponent.like( commentToBeLiked.raw_content );
		} );

		await test.step( 'Unlike the comment', async () => {
			if ( envVariables.TEST_ON_ATOMIC ) {
				// AT comments appear unable to respond to `scrollIntoViewIfNeeded`
				// unless the focus is "unstuck" by shifting the page.
				await page.mouse.wheel( 0, 120 );
			}
			await commentsComponent.unlike( commentToBeUnliked.raw_content );
		} );
	} );
} );
