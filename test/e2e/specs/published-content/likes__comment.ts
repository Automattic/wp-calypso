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
	const comment = DataHelper.getRandomPhrase();
	const postContent =
		'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';
	let page: Page;
	let newPost: PostResponse;
	let newComment: NewCommentResponse;
	let restAPIClient: RestAPIClient;
	let testAccount: TestAccount;

	beforeAll( async function () {
		page = await browser.newPage();

		testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );

		restAPIClient = new RestAPIClient( testAccount.credentials );

		newPost = await restAPIClient.createPost(
			testAccount.credentials.testSites?.primary.id as number,
			{
				title: DataHelper.getTimestamp() as string,
				content: postContent,
			}
		);

		newComment = await restAPIClient.createComment(
			testAccount.credentials.testSites?.primary.id as number,
			newPost.ID,
			comment
		);
	} );

	it( 'View the post', async function () {
		await page.goto( newPost.URL );
	} );

	describe( 'Like', function () {
		let commentsComponent: CommentsComponent;

		beforeAll( async function () {
			// Establish proper state.
			await restAPIClient.commentAction(
				'unlike',
				testAccount.credentials.testSites?.primary.id as number,
				newComment.ID
			);
		} );

		it( 'Like the comment', async function () {
			commentsComponent = new CommentsComponent( page );
			await commentsComponent.like( comment );
		} );
	} );

	describe( 'Unlike', function () {
		let commentsComponent: CommentsComponent;

		beforeAll( async function () {
			// Establish proper state.
			await restAPIClient.commentAction(
				'like',
				testAccount.credentials.testSites?.primary.id as number,
				newComment.ID
			);
		} );

		it( 'Unlike the comment', async function () {
			commentsComponent = new CommentsComponent( page );
			await commentsComponent.unlike( comment );
		} );
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
