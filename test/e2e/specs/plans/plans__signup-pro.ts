/**
 * @group calypso-release
 */

import {
	DataHelper,
	BrowserManager,
	SignupPickPlanPage,
	StartSiteFlow,
	SidebarComponent,
	PlansPage,
	RestAPIClient,
	CartCheckoutPage,
	TestAccount,
	DomainSearchComponent,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle( 'Plans: Create a WordPress.com Pro site as exising user' ),
	function () {
		const blogName = DataHelper.getBlogName();

		let testAccount: TestAccount;
		let page: Page;
		let siteCreatedFlag = false;
		let siteID: string;
		let siteURL: string;
		let siteName: string;

		beforeAll( async () => {
			page = await browser.newPage();

			testAccount = new TestAccount( 'calypsoPreReleaseUser' );
			await testAccount.authenticate( page );
		} );

		describe( 'Create new site', function () {
			let cartCheckoutPage: CartCheckoutPage;

			it( 'Navigate to /start', async function () {
				await page.goto( DataHelper.getCalypsoURL( 'start' ) );
			} );

			it( 'Set store cookie', async function () {
				await BrowserManager.setStoreCookie( page );
			} );

			it( 'Select a .wordpres.com domain name', async function () {
				const domainSearchComponent = new DomainSearchComponent( page );
				await domainSearchComponent.search( blogName );
				await domainSearchComponent.selectDomain( '.wordpress.com' );
			} );

			it( 'Select WordPress.com Pro plan', async function () {
				const signupPickPlanPage = new SignupPickPlanPage( page );
				const details = await signupPickPlanPage.selectPlan( 'Pro' );

				siteID = details.id;
				siteURL = details.url;
				siteName = details.name;

				siteCreatedFlag = true;
			} );

			it( 'See secure checkout', async function () {
				cartCheckoutPage = new CartCheckoutPage( page );
				await cartCheckoutPage.validateCartItem( 'WordPress.com Pro' );
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

		describe( 'Validate WordPress.com Pro functionality', function () {
			let sidebarComponent: SidebarComponent;

			it( 'Sidebar states user is on WordPress.com Pro plan', async function () {
				sidebarComponent = new SidebarComponent( page );
				const plan = await sidebarComponent.getCurrentPlanName();
				expect( plan ).toBe( 'Pro' );
			} );

			it( 'Navigate to Upgrades > Plans', async function () {
				sidebarComponent = new SidebarComponent( page );
				await sidebarComponent.navigate( 'Upgrades', 'Plans' );
			} );

			it( 'Plans page states user is on WordPress.com Pro plan', async function () {
				const plansPage = new PlansPage( page, 'current' );
				await plansPage.validateActivePlan( 'Pro' );
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

			const response = await restAPIClient.deleteSite( {
				url: siteURL,
				id: siteID,
				name: siteName,
			} );

			// If the response is `null` then no action has been
			// performed.
			if ( response ) {
				// The only correct response is the string
				// "deleted".
				if ( response.status !== 'deleted' ) {
					console.warn(
						`Failed to delete siteID ${ siteID }.\nExpected: "deleted", Got: ${ response.status }`
					);
				} else {
					console.log( `Successfully deleted siteID ${ siteID }.` );
				}
			}
		} );
	}
);
