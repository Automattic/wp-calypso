/**
 * @group calypso-release
 */

import {
	DataHelper,
	BrowserManager,
	SignupPickPlanPage,
	StartSiteFlow,
	SidebarComponent,
	RestAPIClient,
	CartCheckoutPage,
	TestAccount,
	SignupDomainPage,
	NewSiteResponse,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiDeleteSite } from '../shared';

declare const browser: Browser;

describe.skip(
	DataHelper.createSuiteTitle( 'Plans: Create a WordPress.com/Business site as exising user' ),
	function () {
		const planName = 'Business';

		let testAccount: TestAccount;
		let page: Page;
		let siteCreatedFlag = false;
		let newSiteDetails: NewSiteResponse;

		beforeAll( async function () {
			page = await browser.newPage();

			testAccount = new TestAccount( 'calypsoPreReleaseUser' );
			await testAccount.authenticate( page );
		} );

		describe( 'Create new site', function () {
			let cartCheckoutPage: CartCheckoutPage;

			beforeAll( async function () {
				await BrowserManager.setStoreCookie( page );
			} );

			it( 'Navigate to /start', async function () {
				await page.goto( DataHelper.getCalypsoURL( 'start' ) );
			} );

			it( 'Skip domain selection', async function () {
				const signupDomainPage = new SignupDomainPage( page );
				await signupDomainPage.searchForFooDomains();
				await signupDomainPage.skipDomainSelection();
			} );

			it( `Select WordPress.com ${ planName } plan`, async function () {
				const signupPickPlanPage = new SignupPickPlanPage( page );
				newSiteDetails = await signupPickPlanPage.selectPlan( planName );

				siteCreatedFlag = true;
			} );

			it( 'See secure checkout', async function () {
				cartCheckoutPage = new CartCheckoutPage( page );
				await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
			} );

			it( 'Enter payment details', async function () {
				await cartCheckoutPage.selectSavedCard( 'End to End Testing' );
			} );

			it( 'Make purchase', async function () {
				await cartCheckoutPage.purchase( { timeout: 75 * 1000 } );
			} );

			it( 'Skip Onboarding', async function () {
				await page.waitForURL( /setup\/site-setup\/goals/ );
				const startSiteFlow = new StartSiteFlow( page );
				await startSiteFlow.clickButton( 'Skip to dashboard' );
			} );

			it( 'See Home', async function () {
				await page.waitForURL( /home/ );
			} );
		} );

		describe( `Validate WordPress.com ${ planName } functionality`, function () {
			let sidebarComponent: SidebarComponent;

			it( `Sidebar states user is on WordPress.com ${ planName } plan`, async function () {
				sidebarComponent = new SidebarComponent( page );
				const currentPlan = await sidebarComponent.getCurrentPlanName();
				expect( currentPlan ).toBe( planName );
			} );
		} );

		afterAll( async function () {
			if ( ! siteCreatedFlag ) {
				return;
			}

			const restAPIClient = new RestAPIClient( {
				username: testAccount.credentials.username,
				password: testAccount.credentials.password,
			} );

			await apiDeleteSite( restAPIClient, {
				url: newSiteDetails.blog_details.url,
				id: newSiteDetails.blog_details.blogid,
				name: newSiteDetails.blog_details.blogname,
			} );
		} );
	}
);
