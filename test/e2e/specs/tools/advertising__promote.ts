/**
 * @group calypso-pr
 * @group jetpack-wpcom-integration
 */

import {
	getTestAccountByFeature,
	envToFeatureKey,
	envVariables,
	DataHelper,
	SidebarComponent,
	AdvertisingPage,
	TestAccount,
	MediaHelper,
	BlazeCampaignPage,
	RestAPIClient,
	PostResponse,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { skipDescribeIf } from '../../jest-helpers';
import { TEST_IMAGE_PATH } from '../constants';

declare const browser: Browser;

/**
 * Walks through the Advertising/Blaze flow until immediately prior to the checkout.
 *
 * Keywords: Jetpack, Blaze, Advertising
 */
skipDescribeIf( envVariables.ATOMIC_VARIATION === 'private' )(
	DataHelper.createSuiteTitle( 'Advertising: Promote' ),
	function () {
		const pageTitle = DataHelper.getRandomPhrase();
		const snippet = Array( 5 ).fill( DataHelper.getRandomPhrase() ).toString();

		let newPostDetails: PostResponse;
		let page: Page;
		let restAPIClient: RestAPIClient;
		let testAccount: TestAccount;
		let advertisingPage: AdvertisingPage;
		let blazeCampaignPage: BlazeCampaignPage;

		beforeAll( async () => {
			page = await browser.newPage();

			const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );
			testAccount = new TestAccount( accountName );

			// Createa a new test post before starting the test, to ensure at least one
			// available post.
			restAPIClient = new RestAPIClient( testAccount.credentials );
			newPostDetails = await restAPIClient.createPost(
				testAccount.credentials.testSites?.primary.id as number,
				{
					title: pageTitle,
				}
			);

			await testAccount.authenticate( page );

			advertisingPage = new AdvertisingPage( page );
		} );

		it( 'Navigate to Tools > Advertising page', async function () {
			if ( envVariables.ATOMIC_VARIATION === 'ecomm-plan' ) {
				await advertisingPage.visit( testAccount.getSiteURL( { protocol: false } ) );
			} else {
				const sidebarComponent = new SidebarComponent( page );
				await sidebarComponent.navigate( 'Tools', 'Advertising' );
			}
		} );

		it( 'Click on Promote for the first post', async function () {
			await advertisingPage.clickButtonByNameOnRow( 'Promote', { postTitle: pageTitle } );
		} );

		it( 'Land in Blaze campaign landing page', async function () {
			await page.waitForURL( /advertising/ );
			blazeCampaignPage = new BlazeCampaignPage( page );
		} );

		it( 'Click on Get started', async function () {
			await blazeCampaignPage.clickButton( 'Get started' );
		} );

		it( 'Upload image', async function () {
			const testFile = await MediaHelper.createTestFile( TEST_IMAGE_PATH );
			await blazeCampaignPage.uploadImage( testFile );
		} );

		it( 'Enter title and snippet', async function () {
			await blazeCampaignPage.enterText( 'Page title', pageTitle );
			await blazeCampaignPage.enterText( 'Article Snippet', snippet );
		} );

		it( 'Validate preview', async function () {
			await blazeCampaignPage.validatePreview( { title: pageTitle, snippet: snippet } );
		} );

		afterAll( async function () {
			await restAPIClient.deletePost(
				testAccount.credentials.testSites?.primary.id as number,
				newPostDetails.ID
			);
		} );
	}
);
