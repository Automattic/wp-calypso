/**
 * @group gutenberg
 */

import {
	DataHelper,
	CommentsComponent,
	TestAccount,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
	RestAPIClient,
	NewCommentResponse,
	PostResponse,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( 'Likes: Comment', function () {
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
	const postContent =
		'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';
	let page: Page;
	let commentsComponent: CommentsComponent;
	let testAccount: TestAccount;
	let newPost: PostResponse;
	let commentToBeLiked: NewCommentResponse;
	let commentToBeUnliked: NewCommentResponse;
	let restAPIClient: RestAPIClient;

	it( 'Setup the test', async function () {
		page = await browser.newPage();

		testAccount = new TestAccount( accountName );

		restAPIClient = new RestAPIClient( testAccount.credentials );

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

		// The comment takes some time to settle. If we request the like
		// immediately we might be getting the `unknown_comment` error. Let's do
		// a few retries to make sure the like is getting through.
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

	it( 'View the post', async function () {
		await page.goto( newPost.URL );
	} );

	it( 'Like the comment', async function () {
		commentsComponent = new CommentsComponent( page );
		await commentsComponent.like( commentToBeLiked.raw_content );
	} );

	it( 'Unlike the comment', async function () {
		if ( envVariables.TEST_ON_ATOMIC ) {
			// AT comments appear unable to respond to `scrollIntoViewIfNeeded`
			// unless the focus is "unstuck" by shiting the page.
			await page.mouse.wheel( 0, 120 );
		}
		await commentsComponent.unlike( commentToBeUnliked.raw_content );
	} );

	afterAll( async function () {
		if ( ! newPost ) {
			return;
		}
		await restAPIClient.deletePost(
			testAccount.credentials.testSites?.primary.id as number,
			newPost.ID
		);
	} );
} );
