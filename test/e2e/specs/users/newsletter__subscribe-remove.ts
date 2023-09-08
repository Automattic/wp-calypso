/**
 * @group jetpack-wpcom-integration
 * @group calypso-release
 */

import {
	getTestAccountByFeature,
	envToFeatureKey,
	envVariables,
	DataHelper,
	TestAccount,
	RestAPIClient,
	PostResponse,
	PublishedPostPage,
	EmailClient,
	SecretsManager,
	SubscribersPage,
	SubscriptionManagementPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { skipDescribeIf } from '../../jest-helpers';

declare const browser: Browser;

/**
 * Walks through the newsletter lifecycle of a user signing up for newsletters
 * from a published post, then being removed from subscribers.
 *
 * Keywords: Newsletters, Jetpack, Email Subscribers, Email Followers
 */
skipDescribeIf( envVariables.ATOMIC_VARIATION === 'private' )(
	DataHelper.createSuiteTitle( `Newsletter: Subscribe and Remove` ),
	function () {
		// Subscribing "user" setup.
		const inboxID = SecretsManager.secrets.mailosaur.manualTesting;
		const postTitle = DataHelper.getDateString( 'ISO-8601' ) as string;
		const emailClient = new EmailClient();
		const testEmail = emailClient.getTestEmailAddress( inboxID );

		let page: Page;
		let testAccount: TestAccount;
		let restAPIClient: RestAPIClient;
		let newPostDetails: PostResponse;
		let subscribersPage: SubscribersPage;

		beforeAll( async function () {
			page = await browser.newPage();

			const features = envToFeatureKey( envVariables );
			const accountName = getTestAccountByFeature( features );

			// Initizlie the TestAccount object, but do not authenticate
			// to Calypso.
			testAccount = new TestAccount( accountName );

			// Create a new post on the site with the Subscribe block.
			restAPIClient = new RestAPIClient( testAccount.credentials );
			newPostDetails = await restAPIClient.createPost(
				testAccount.credentials.testSites?.primary.id as number,
				{
					title: postTitle,
					content: '<!-- wp:jetpack/subscriptions /-->',
				}
			);
		} );

		describe( 'As subscribing user', function () {
			it( 'Navigate to published post page', async function () {
				await page.goto( newPostDetails.URL );
			} );

			it( 'Subscribe to the site', async function () {
				const publishedPostPage = new PublishedPostPage( page );
				await publishedPostPage.subscribe( testEmail );
			} );

			it( 'Confirm email subscription', async function () {
				const message = await emailClient.getLastMatchingMessage( {
					inboxId: inboxID,
					subject: 'Confirm your subscription',
					sentTo: testEmail,
				} );

				const confirmationURL = emailClient.getLinkFromMessageByKey( message, 'Confirm now' );
				expect( confirmationURL ).not.toBe( null );

				await page.goto( confirmationURL as string );
			} );

			// Updated expecataion.
			// @see: rWPGIT4ed687fb18bc-code
			it( 'User is taken to the blog home page', async function () {
				await page.waitForURL( new RegExp( testAccount.getSiteURL( { protocol: false } ) ) );
			} );

			it( 'Subscribed site is listed in Subscription Management page', async function () {
				await page.goto( DataHelper.getCalypsoURL( 'subscriptions/sites/en' ), {
					waitUntil: 'domcontentloaded',
				} );

				const subscriptionManagementPage = new SubscriptionManagementPage( page );
				await subscriptionManagementPage.validateSiteSubscribed(
					testAccount.getSiteURL( { protocol: false } )
				);
			} );
		} );

		describe( 'As publishing user', function () {
			beforeAll( async function () {
				// Authenticate as the publishing user.
				await testAccount.authenticate( page );

				subscribersPage = new SubscribersPage( page );
			} );

			it( 'Navigate to the Subscribers page', async function () {
				await subscribersPage.visit( testAccount.getSiteURL( { protocol: false } ) );
			} );

			it( 'Search for subscribed user', async function () {
				await subscribersPage.validateSubscriber( testEmail );
			} );

			it( 'Remove subscribed user', async function () {
				await subscribersPage.removeSubscriber( testEmail );
			} );
		} );

		afterAll( async function () {
			try {
				// Clean up the subscriber and the post.
				await restAPIClient.deleteSubscriber(
					testAccount.credentials.testSites?.primary.id as number,
					testEmail
				);

				await restAPIClient.deletePost(
					testAccount.credentials.testSites?.primary.id as number,
					newPostDetails.ID
				);
			} catch {
				// noop
			}
		} );
	}
);
