import {
	CommentsComponent,
	RestAPIClient,
	NewCommentResponse,
	PostResponse,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

test.describe( 'Likes: Comment', { tag: [ tags.GUTENBERG ] }, () => {
	let restAPIClient: RestAPIClient;
	let newPost: PostResponse;

	test( 'As a user, I can like and unlike comments', async ( {
		page,
		accountGivenByEnvironment,
		helperData,
		environment,
	} ) => {
		const postContent =
			'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';
		let commentsComponent: CommentsComponent;
		let commentToBeLiked: NewCommentResponse;
		let commentToBeUnliked: NewCommentResponse;

		await test.step( 'Given I have a post with comments', async function () {
			restAPIClient = new RestAPIClient( accountGivenByEnvironment.credentials );

			newPost = await restAPIClient.createPost(
				accountGivenByEnvironment.credentials.testSites?.primary.id as number,
				{
					title: helperData.getTimestamp() as string,
					content: postContent,
				}
			);

			commentToBeLiked = await restAPIClient.createComment(
				accountGivenByEnvironment.credentials.testSites?.primary.id as number,
				newPost.ID,
				helperData.getRandomPhrase()
			);
			commentToBeUnliked = await restAPIClient.createComment(
				accountGivenByEnvironment.credentials.testSites?.primary.id as number,
				newPost.ID,
				helperData.getRandomPhrase()
			);

			// The comment takes some time to settle. If we request the like
			// immediately we might be getting the `unknown_comment` error. Let's do
			// a few retries to make sure the like is getting through.
			const likeRetryCount = 10;
			for ( let i = 0; i <= likeRetryCount; i++ ) {
				try {
					await restAPIClient.commentAction(
						'like',
						accountGivenByEnvironment.credentials.testSites?.primary.id as number,
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
		} );

		await test.step( `And I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async function () {
			await accountGivenByEnvironment.authenticate( page );
		} );

		await test.step( 'When I view the post', async function () {
			await page.goto( newPost.URL );
		} );

		await test.step( 'Then I can like a comment', async function () {
			commentsComponent = new CommentsComponent( page );
			await commentsComponent.like( commentToBeLiked.raw_content );
		} );

		await test.step( 'And I can unlike a comment', async function () {
			if ( environment.TEST_ON_ATOMIC ) {
				// AT comments appear unable to respond to `scrollIntoViewIfNeeded`
				// unless the focus is "unstuck" by shifting the page.
				await page.mouse.wheel( 0, 120 );
			}
			await commentsComponent.unlike( commentToBeUnliked.raw_content );
		} );

		// Cleanup
		if ( newPost ) {
			await restAPIClient.deletePost(
				accountGivenByEnvironment.credentials.testSites?.primary.id as number,
				newPost.ID
			);
		}
	} );
} );
