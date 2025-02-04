/**
 * @group calypso-pr
 * @group jetpack-wpcom-integration
 */

import {
	getTestAccountByFeature,
	envToFeatureKey,
	envVariables,
	DataHelper,
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
 * The actual checkout is outside the scope of this spec.
 *
 * @see pdWQjU-rL-p2#comment-575.
 *
 * Keywords: Jetpack, Blaze, Advertising
 */
skipDescribeIf( envVariables.ATOMIC_VARIATION === 'private' )(
	DataHelper.createSuiteTitle( 'Advertising: Promote' ),
	function () {
		// The input has a limit, so let's stay way under to be safe!
		const pageTitle = DataHelper.getRandomPhrase().slice( 0, 20 );
		const snippet = Array( 2 ).fill( DataHelper.getRandomPhrase() ).toString();

		let newPostDetails: PostResponse;
		let page: Page;
		let restAPIClient: RestAPIClient;
		let testAccount: TestAccount;
		let advertisingPage: AdvertisingPage;
		let blazeCampaignPage: BlazeCampaignPage;

		beforeAll( async () => {
			page = await browser.newPage();

			const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ), [
				{ gutenberg: 'stable', siteType: 'simple', accountName: 'defaultUser' },
			] );

			testAccount = new TestAccount( accountName );

			restAPIClient = new RestAPIClient( testAccount.credentials );

			// Createa a new test post before starting the test if site has no published post.
			const hasPosts = await restAPIClient.siteHasPost(
				testAccount.credentials.testSites?.primary.id as number,
				{ state: 'publish' }
			);

			if ( ! hasPosts ) {
				newPostDetails = await restAPIClient.createPost(
					testAccount.credentials.testSites?.primary.id as number,
					{
						title: pageTitle,
					}
				);
			}

			await testAccount.authenticate( page );

			advertisingPage = new AdvertisingPage( page );
		} );

		it( 'Navigate to Tools > Advertising page', async function () {
			await advertisingPage.visit( testAccount.getSiteURL( { protocol: false } ) );
		} );

		it( 'Click on Promote for the first post', async function () {
			await advertisingPage.clickButtonByNameOnRow( 'Promote', { row: 0 } );
		} );

		it( 'Land in Blaze campaign landing page', async function () {
			await page.waitForURL( /advertising/ );

			blazeCampaignPage = new BlazeCampaignPage( page );
		} );

		it( 'Click on Get started', async function () {
			await blazeCampaignPage.clickButton( 'Get started' );
		} );

		it( 'Click on Save', async function () {
			await blazeCampaignPage.clickButton( 'Save' );
		} );

		it( 'Upload image', async function () {
			const testFile = await MediaHelper.createTestFile( TEST_IMAGE_PATH );
			await blazeCampaignPage.uploadImage( testFile );
		} );

		it( 'Enter title and snippet', async function () {
			await blazeCampaignPage.enterText( 'Page title', pageTitle );
			await blazeCampaignPage.enterText( 'Ad text', snippet );
		} );

		it( 'Validate preview', async function () {
			await blazeCampaignPage.validatePreview( { title: pageTitle, snippet: snippet } );
		} );

		afterAll( async function () {
			if ( ! newPostDetails ) {
				return;
			}

			await restAPIClient.deletePost(
				testAccount.credentials.testSites?.primary.id as number,
				newPostDetails.ID
			);
		} );
	}
);
