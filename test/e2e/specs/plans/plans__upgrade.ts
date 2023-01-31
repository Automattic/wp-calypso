/**
 * @group calypso-release
 */

import {
	DataHelper,
	SidebarComponent,
	PlansPage,
	CartCheckoutPage,
	TestAccount,
	RestAPIClient,
	BrowserManager,
	SecretsManager,
	NewSiteResponse,
	NewPostResponse,
	PublishedPostPage,
	NavbarComponent,
	MediaHelper,
	TestFile,
	MediaPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { TEST_IMAGE_PATH } from '../constants';
import { apiDeleteSite } from '../shared';

declare const browser: Browser;
const postTitles = Array.from( { length: 2 }, () => DataHelper.getRandomPhrase() );

describe(
	DataHelper.createSuiteTitle(
		'Plans: Upgrade exising WordPress.com Free site to WordPress.com Premium'
	),
	function () {
		const blogName = DataHelper.getBlogName();
		const planName = 'Premium';
		const publishedPosts: NewPostResponse[] = [];
		let testMediaFile: TestFile;
		let siteCreatedFlag: boolean;
		let newSiteDetails: NewSiteResponse;
		let restAPIClient: RestAPIClient;
		let page: Page;

		beforeAll( async function () {
			// Set up the test site programmatically against simpleSiteFreePlanUser.
			const credentials = SecretsManager.secrets.testAccounts.simpleSiteFreePlanUser;

			restAPIClient = new RestAPIClient( credentials );
			console.info( 'Creating a new test site.' );
			newSiteDetails = await restAPIClient.createSite( {
				name: blogName,
				title: blogName,
			} );
			console.info( `New site created: ${ newSiteDetails.blog_details.url }` );
			siteCreatedFlag = true;

			// Add posts to site.
			console.info( 'Adding test posts to the site.' );
			for await ( const title of postTitles ) {
				publishedPosts.push(
					await restAPIClient.createPost( newSiteDetails.blog_details.blogid, {
						title: title,
					} )
				);
			}

			console.info( 'Adding test image to site.' );
			testMediaFile = await MediaHelper.createTestFile( TEST_IMAGE_PATH );
			await restAPIClient.uploadMedia( newSiteDetails.blog_details.blogid, {
				media: testMediaFile,
			} );

			// Launch browser.
			page = await browser.newPage();

			// Authenticate as simpleSiteFreePlanUser.
			const testAccount = new TestAccount( 'simpleSiteFreePlanUser' );
			await testAccount.authenticate( page );
		} );

		describe( `Upgrade to WordPress.com ${ planName }`, function () {
			let cartCheckoutPage: CartCheckoutPage;
			let plansPage: PlansPage;

			beforeAll( async function () {
				await BrowserManager.setStoreCookie( page );
			} );

			it( 'Navigate to Upgrades > Plans', async function () {
				await page.goto(
					DataHelper.getCalypsoURL( `/plans/${ newSiteDetails.blog_details.site_slug }` )
				);
			} );

			it( 'View available plans', async function () {
				plansPage = new PlansPage( page );
			} );

			it( `Click button to upgrade to WordPress.com ${ planName }`, async function () {
				await plansPage.selectPlan( 'Premium' );
			} );

			it( `WordPress.com ${ planName } is added to cart`, async function () {
				cartCheckoutPage = new CartCheckoutPage( page );
				await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
			} );

			it( 'Make purchase', async function () {
				await cartCheckoutPage.purchase( { timeout: 60 * 1000 } );
			} );

			it( 'Return to My Home dashboard', async function () {
				const navbarComponent = new NavbarComponent( page );
				await navbarComponent.clickMySites();
			} );
		} );

		describe( `Validate WordPress.com ${ planName } functionality`, function () {
			let sidebarComponent: SidebarComponent;

			it( 'Navigate to Upgrades > Plans', async function () {
				sidebarComponent = new SidebarComponent( page );
				await sidebarComponent.navigate( 'Upgrades', 'Plans' );
			} );

			it( `Plans page states user is on WordPress.com ${ planName } plan`, async function () {
				const plansPage = new PlansPage( page );
				await plansPage.validateActivePlan( 'Premium' );
			} );
		} );

		describe( 'Validate site content is intact', function () {
			let testPage: Page;

			beforeAll( async function () {
				testPage = await browser.newPage();
			} );

			it.each( postTitles )( 'Post %s is preserved', async function ( postTitle: string ) {
				// Locate the new post response for the post in question.
				const postResponse = publishedPosts.find(
					( r ) => r.title === postTitle
				) as NewPostResponse;

				// Visit the page and validate.
				await testPage.goto( postResponse.URL );
				const publishedPostPage = new PublishedPostPage( testPage );
				await publishedPostPage.validateTitle( postTitle );
			} );

			it( 'Uploaded media is preserved', async function () {
				const mediaPage = new MediaPage( page );
				await mediaPage.visit( newSiteDetails.blog_details.site_slug );
				await mediaPage.selectItem( { name: testMediaFile.basename } );
			} );
		} );

		afterAll( async function () {
			if ( ! siteCreatedFlag ) {
				return;
			}

			await apiDeleteSite( restAPIClient, {
				url: newSiteDetails.blog_details.url,
				id: newSiteDetails.blog_details.blogid,
				name: newSiteDetails.blog_details.blogname,
			} );
		} );
	}
);
