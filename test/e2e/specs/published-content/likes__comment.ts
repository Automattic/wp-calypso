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

	beforeAll( async function () {
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

		// For AT sites the API will respond with a HTTP 404
		// unless time is given for the comment to "settle" in place.
		// It could be argued that adding this arbitrary delay is
		// "more representative" of users.
		// @see: https://github.com/Automattic/wp-calypso/issues/75952
		if ( envVariables.TEST_ON_ATOMIC ) {
			await page.waitForTimeout( 5 * 1000 );
		}

		// Establish proper state for the comment to be unliked.
		await restAPIClient.commentAction(
			'like',
			testAccount.credentials.testSites?.primary.id as number,
			commentToBeUnliked.ID
		);

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
