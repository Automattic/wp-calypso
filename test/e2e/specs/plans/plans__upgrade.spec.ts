import {
	BrowserManager,
	CartCheckoutPage,
	DataHelper,
	MediaHelper,
	MediaPage,
	NavbarComponent,
	NewSiteResponse,
	PlansPage,
	PostResponse,
	PublishedPostPage,
	RestAPIClient,
	SecretsManager,
	SidebarComponent,
	TestAccount,
	TestFile,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';
import { TEST_IMAGE_PATH } from '../constants';
import { apiDeleteSite } from '../shared';

const postTitles = Array.from( { length: 2 }, () => DataHelper.getRandomPhrase() );

// .fixme: two setup-side blockers found this round. (1) createSite was rejected
// with "blog_name_invalid" for the raw generated blog name — fixed below by
// passing find_available_url: true (matching apiCreateFreeSiteForUser). (2) With
// that fix, createSite now returns "user_get_blocked: The user is blocked from
// creating a new site" for the simpleSiteFreePlanUser account, which did not
// clear after waiting. That account appears to be at its free-site limit (likely
// from accumulated, uncleaned E2E sites); it needs account-side cleanup/
// provisioning before the upgrade flow can be exercised. The find_available_url
// fix is kept so that, once the account can create sites again, only the UI flow
// needs re-validation. See TESTOPS-49.
test.describe(
	DataHelper.createSuiteTitle(
		'Plans: Upgrade existing WordPress.com Free site to WordPress.com Premium'
	),
	{ tag: [ tags.CALYPSO_RELEASE ] },
	() => {
		const blogName = DataHelper.getBlogName();
		const planName = 'Premium';

		let newSiteDetails: NewSiteResponse;
		let restAPIClient: RestAPIClient;
		let siteCreatedFlag = false;
		let testMediaFile: TestFile;
		const publishedPosts: PostResponse[] = [];

		test.afterAll( async () => {
			if ( ! siteCreatedFlag ) {
				return;
			}
			await apiDeleteSite( restAPIClient, {
				url: newSiteDetails.blog_details.url,
				id: newSiteDetails.blog_details.blogid,
				name: newSiteDetails.blog_details.blogname,
			} );
		} );

		test( 'As a user, I can upgrade a free site to Premium and validate the plan and content', async ( {
			page,
		} ) => {
			await test.step( 'Setup: create test site and content via API', async () => {
				const credentials = SecretsManager.secrets.testAccounts.simpleSiteFreePlanUser;
				restAPIClient = new RestAPIClient( credentials );

				console.info( 'Creating a new test site.' );
				newSiteDetails = await restAPIClient.createSite( {
					name: blogName,
					title: blogName,
					// Let the API resolve a valid, available URL. Without this the raw
					// generated blog name is rejected with "blog_name_invalid".
					find_available_url: true,
				} );
				console.info( `New site created: ${ newSiteDetails.blog_details.url }` );
				siteCreatedFlag = true;

				console.info( 'Adding test posts to the site.' );
				for ( const title of postTitles ) {
					publishedPosts.push(
						await restAPIClient.createPost( newSiteDetails.blog_details.blogid, { title } )
					);
				}

				console.info( 'Adding test image to site.' );
				testMediaFile = await MediaHelper.createTestFile( TEST_IMAGE_PATH );
				await restAPIClient.uploadMedia( newSiteDetails.blog_details.blogid, {
					media: testMediaFile,
				} );

				const testAccount = new TestAccount( 'simpleSiteFreePlanUser' );
				await testAccount.authenticate( page );
			} );

			await test.step( 'Set store cookie', async () => {
				await BrowserManager.setStoreCookie( page );
			} );

			await test.step( 'Navigate to Upgrades > Plans', async () => {
				await page.goto(
					DataHelper.getCalypsoURL( `/plans/${ newSiteDetails.blog_details.site_slug }` )
				);
			} );

			await test.step( `Click button to upgrade to WordPress.com ${ planName }`, async () => {
				const plansPage = new PlansPage( page );
				await plansPage.selectPlan( 'Premium' );
			} );

			await test.step( `WordPress.com ${ planName } is added to cart`, async () => {
				const cartCheckoutPage = new CartCheckoutPage( page );
				await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
			} );

			await test.step( 'Make purchase', async () => {
				const cartCheckoutPage = new CartCheckoutPage( page );
				try {
					await cartCheckoutPage.purchase( { timeout: 75 * 1000 } );
				} catch {
					// Work around an issue where purchase flow does not complete and redirect beyond the timeout.
					await page.goto(
						DataHelper.getCalypsoURL(
							`checkout/thank-you/${ newSiteDetails.blog_details.site_slug }`
						)
					);
				}
			} );

			await test.step( 'Return to My Home dashboard', async () => {
				const navbarComponent = new NavbarComponent( page );
				await navbarComponent.clickMySites();
			} );

			await test.step( 'Navigate to Upgrades > Plans', async () => {
				const sidebarComponent = new SidebarComponent( page );
				await sidebarComponent.navigate( 'Upgrades', 'Plans' );
			} );

			await test.step( `Plans page states user is on WordPress.com ${ planName } plan`, async () => {
				const plansPage = new PlansPage( page );
				await plansPage.validateActivePlan( planName );
			} );

			const testPage = await page.context().newPage();

			for ( const postTitle of postTitles ) {
				await test.step( `Post ${ postTitle } is preserved`, async () => {
					const postResponse = publishedPosts.find(
						( r ) => r.title === postTitle
					) as PostResponse;
					await testPage.goto( postResponse.URL );
					const publishedPostPage = new PublishedPostPage( testPage );
					await publishedPostPage.validateTitle( postTitle );
				} );
			}

			await test.step( 'Uploaded media is preserved', async () => {
				const mediaPage = new MediaPage( page );
				await mediaPage.visit( newSiteDetails.blog_details.site_slug );
				await mediaPage.selectItem( { name: testMediaFile.basename } );
			} );
		} );
	}
);
