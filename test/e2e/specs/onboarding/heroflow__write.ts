/**
 * @group calypso-release
 */

import {
	DataHelper,
	StartSiteFlow,
	RestAPIClient,
	SecretsManager,
	NewSiteResponse,
	TestAccount,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiDeleteSite } from '../shared';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Onboarding heroflow: write' ), function () {
	const blogName = DataHelper.getBlogName();
	const tagline = '${ blogName } tagline';

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

		// Launch browser.
		page = await browser.newPage();

		// Authenticate as simpleSiteFreePlanUser.
		const testAccount = new TestAccount( 'simpleSiteFreePlanUser' );
		await testAccount.authenticate( page );
	} );

	describe( 'Onboarding flow', function () {
		let startSiteFlow: StartSiteFlow;

		it( 'Navigate to setup > goals', async function () {
			await page.goto(
				DataHelper.getCalypsoURL(
					`/setup/goals?siteSlug=${ newSiteDetails.blog_details.site_slug }`
				)
			);
		} );

		it( 'Skip goals step', async function () {
			startSiteFlow = new StartSiteFlow( page );

			await page.waitForLoadState( 'networkidle' );
			const currentStep = await startSiteFlow.getCurrentStep();

			if ( currentStep === 'goals' ) {
				await startSiteFlow.selectGoal( 'Write & Publish' );
				await startSiteFlow.clickButton( 'Continue' );
			}
		} );

		it( 'Select a vertical', async function () {
			const currentStep = await startSiteFlow.getCurrentStep();
			if ( currentStep === 'vertical' ) {
				await startSiteFlow.enterVertical( 'People & Society' );
				await startSiteFlow.clickButton( 'Continue' );
			}
		} );

		it( 'Select "write" path', async function () {
			const currentStep = await startSiteFlow.getCurrentStep();
			if ( currentStep === 'intent' ) {
				await startSiteFlow.clickButton( 'Start writing' );
			}
		} );

		it( 'Enter blog name', async function () {
			await startSiteFlow.enterBlogName( blogName );
		} );

		it( 'Enter tagline', async function () {
			await startSiteFlow.enterTagline( tagline );
		} );

		it( 'Click continue', async function () {
			await startSiteFlow.clickButton( 'Continue' );
		} );

		it( 'Select "Choose a design" path', async function () {
			await startSiteFlow.clickButton( 'View designs' );
		} );

		it( 'See design picker screen', async function () {
			await startSiteFlow.validateOnDesignPickerScreen();
		} );

		it( 'Navigate back', async function () {
			await startSiteFlow.goBackOneScreen();
		} );

		it( 'Select "Draft your first post" path and land in editor', async function () {
			const navigationTimeout = 2 * 60 * 1000;
			// Let's add some resilience based on potential A/B test landing places for posts
			const navigationPromise = Promise.race( [
				page.waitForNavigation( { url: '**/post/**', timeout: navigationTimeout } ),
				page.waitForNavigation( {
					url: '**/wp-admin/post-new.php**',
					timeout: navigationTimeout,
				} ),
			] );

			await Promise.all( [ navigationPromise, startSiteFlow.clickButton( 'Start writing' ) ] );
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
} );
