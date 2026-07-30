/**
 * Walks through the newsletter lifecycle of a user signing up for newsletters
 * from a published post, then being removed from subscribers.
 *
 * Keywords: Newsletters, Jetpack, Email Subscribers, Email Followers
 */

import {
	DataHelper,
	EmailClient,
	PostResponse,
	PublishedPostPage,
	RestAPIClient,
	SecretsManager,
	SubscribersPage,
	TestAccount,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { expect, skipIfNotJetpackTarget, tags, test } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'Newsletter: Subscribe and Remove' ),
	{ tag: [ tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		// Subscription confirmation emails only go out from a site with Jetpack
		// Subscriptions; the default account's site does not have them.
		skipIfNotJetpackTarget();

		const inboxID = SecretsManager.secrets.mailosaur.manualTesting;
		const postTitle = DataHelper.getDateString( 'ISO-8601' ) as string;
		const emailClient = new EmailClient();
		const testEmail = emailClient.getTestEmailAddress( inboxID );

		let testAccount: TestAccount;
		let newPostDetails: PostResponse;
		let restAPIClient: RestAPIClient;

		test.afterAll( async () => {
			try {
				if ( testAccount && restAPIClient && newPostDetails ) {
					await restAPIClient.deleteSubscriber(
						testAccount.credentials.testSites?.primary.id as number,
						testEmail
					);

					await restAPIClient.deletePost(
						testAccount.credentials.testSites?.primary.id as number,
						newPostDetails.ID
					);
				}
			} catch {
				// noop
			}
		} );

		test( 'As a user, I can subscribe to a newsletter and be removed by the publisher', async ( {
			page,
		} ) => {
			test.skip(
				envVariables.ATOMIC_VARIATION === 'private',
				'Newsletter subscriptions not supported on private sites'
			);

			await test.step( 'Setup: create post with Subscribe block via API', async () => {
				// Must resolve inside the test: a throw at describe scope aborts collection for the entire run.
				testAccount = new TestAccount( getTestAccountByFeature( envToFeatureKey( envVariables ) ) );
				restAPIClient = new RestAPIClient( testAccount.credentials );
				newPostDetails = await restAPIClient.createPost(
					testAccount.credentials.testSites?.primary.id as number,
					{
						title: postTitle,
						content: '<!-- wp:jetpack/subscriptions /-->',
					}
				);
			} );

			await test.step( 'Navigate to published post page', async () => {
				await page.goto( newPostDetails.URL );
			} );

			await test.step( 'Subscribe to the site', async () => {
				const publishedPostPage = new PublishedPostPage( page );
				await publishedPostPage.subscribe( testEmail );
			} );

			await test.step( 'Confirm email subscription', async () => {
				const message = await emailClient.getLastMatchingMessage( {
					inboxId: inboxID,
					subject: 'Confirm your subscription',
					sentTo: testEmail,
				} );

				const confirmationURL =
					emailClient.getLinkFromMessageByKey( message, 'Confirm email' ) ??
					emailClient.getLinkFromMessageByKey( message, 'Confirm now' );
				expect( confirmationURL ).not.toBe( null );

				const pageForConfirming = await page.context().newPage();
				const waitForRedirectToOriginalPost = pageForConfirming.waitForURL(
					( url ) => url.href.includes( newPostDetails.URL ),
					{ timeout: 45 * 1000 }
				);
				await pageForConfirming.goto( confirmationURL as string );
				await waitForRedirectToOriginalPost;
			} );

			await test.step( 'Authenticate as the publishing user', async () => {
				await testAccount.authenticate( page );
			} );

			await test.step( 'Navigate to the Subscribers page', async () => {
				const subscribersPage = new SubscribersPage( page );
				await subscribersPage.visit( testAccount.getSiteURL( { protocol: false } ) );
			} );

			await test.step( 'Search for subscribed user', async () => {
				const subscribersPage = new SubscribersPage( page );
				await subscribersPage.validateSubscriber( testEmail );
			} );

			await test.step( 'Remove subscribed user', async () => {
				const subscribersPage = new SubscribersPage( page );
				await subscribersPage.removeSubscriber( testEmail );
			} );
		} );
	}
);
