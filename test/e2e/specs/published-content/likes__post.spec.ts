import {
	ElementHelper,
	PublishedPostPage,
	TestAccount,
	RestAPIClient,
	PostResponse,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

test.describe(
	'Likes: Post',
	{ tag: [ tags.GUTENBERG, tags.CALYPSO_PR, tags.CALYPSO_RELEASE ] },
	() => {
		let restAPIClient: RestAPIClient;
		let newPost: PostResponse;

		test( 'As an authenticated user, I can like and unlike a post', async ( {
			browser,
			page,
			accountGivenByEnvironment,
			helperData,
		} ) => {
			const otherUser = new TestAccount( 'defaultUser' );
			let publishedPostPage: PublishedPostPage;

			await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async function () {
				await accountGivenByEnvironment.authenticate( page );
			} );

			await test.step( 'And I have a published post', async function () {
				restAPIClient = new RestAPIClient( accountGivenByEnvironment.credentials );
				newPost = await restAPIClient.createPost(
					accountGivenByEnvironment.credentials.testSites?.primary.id as number,
					{
						title: helperData.getRandomPhrase(),
					}
				);
			} );

			await test.step( 'When I view the post', async function () {
				await ElementHelper.reloadAndRetry( page, async () => {
					await page.goto( newPost.URL, { timeout: 20 * 1000 } );
				} );
			} );

			await test.step( 'Then I can like the post', async function () {
				await ElementHelper.reloadAndRetry( page, async () => {
					publishedPostPage = new PublishedPostPage( page );
					await publishedPostPage.likePost();
				} );
			} );

			await test.step( 'And I can unlike the post', async function () {
				await ElementHelper.reloadAndRetry( page, async () => {
					publishedPostPage = new PublishedPostPage( page );
					await publishedPostPage.unlikePost();
				} );
			} );

			await test.step( 'When an unauthenticated user views the post', async function () {
				const newPage = await browser.newPage();

				await ElementHelper.reloadAndRetry( newPage, async () => {
					await newPage.goto( newPost.URL, { timeout: 20 * 1000 } );
				} );

				await test.step( 'Then they can login via popup to like the post', async function () {
					newPage.on( 'popup', async ( popup ) => {
						await otherUser.logInViaPopupPage( popup );
					} );

					publishedPostPage = new PublishedPostPage( newPage );
					await publishedPostPage.likePost();
				} );

				await newPage.close();
			} );

			// Cleanup
			if ( newPost ) {
				await restAPIClient.deletePost(
					accountGivenByEnvironment.credentials.testSites?.primary.id as number,
					newPost.ID
				);
			}
		} );
	}
);
