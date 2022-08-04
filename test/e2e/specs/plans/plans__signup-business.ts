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
	DomainSearchComponent,
	MediaPage,
	NewSiteResponse,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiDeleteSite } from '../shared';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle( 'Plans: Create a WordPress.com Business site as exising user' ),
	function () {
		const blogName = DataHelper.getBlogName();
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

			it( 'Select a .wordpres.com domain name', async function () {
				const domainSearchComponent = new DomainSearchComponent( page );
				await domainSearchComponent.search( blogName );
				await domainSearchComponent.selectDomain( '.wordpress.com' );
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
				await cartCheckoutPage.purchase();
			} );

			it( 'Skip to dashboard', async function () {
				const startSiteFlow = new StartSiteFlow( page );
				await Promise.all( [
					page.waitForNavigation( { url: /.*\/home\/.*/ } ),
					startSiteFlow.clickButton( 'Skip to dashboard' ),
				] );
			} );
		} );

		describe( `Validate WordPress.com ${ planName } functionality`, function () {
			let sidebarComponent: SidebarComponent;

			it( `Sidebar states user is on WordPress.com ${ planName } plan`, async function () {
				sidebarComponent = new SidebarComponent( page );
				const currentPlan = await sidebarComponent.getCurrentPlanName();
				expect( currentPlan ).toBe( planName );
			} );

			it( 'Validate storage capacity', async function () {
				await sidebarComponent.navigate( 'Media' );
				const mediaPage = new MediaPage( page );
				expect( await mediaPage.hasStorageCapacity( 200 ) ).toBe( true );
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
