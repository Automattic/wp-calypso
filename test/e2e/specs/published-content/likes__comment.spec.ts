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
import { expect, tags, test } from '../../lib/pw-base';

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
		if ( envVariables.TEST_ON_ATOMIC ) {
			test.setTimeout( 450_000 );
		}

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

			// On Atomic the comment is created on the site and reaches WordPress.com
			// only once Jetpack sync mirrors it, which can take over two minutes. Until then the
			// likes endpoint answers `unknown_comment` and no like button renders. Since
			// comments sync in creation order, once the second is likeable, the first is too.
			await expect( async () => {
				await restAPIClient.likeComment(
					testAccount.credentials.testSites?.primary.id as number,
					commentToBeUnliked.ID
				);
			} ).toPass( { timeout: 150_000, intervals: [ 5000 ] } );

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
