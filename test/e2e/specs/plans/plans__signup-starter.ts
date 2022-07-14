/**
 *
 */

import {
	DataHelper,
	BrowserManager,
	LoginPage,
	UserSignupPage,
	SignupPickPlanPage,
	StartSiteFlow,
	SidebarComponent,
	PlansPage,
	RestAPIClient,
	CartCheckoutPage,
	DomainSearchComponent,
	IndividualPurchasePage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared';
import type { NewUserResponse } from '@automattic/calypso-e2e';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle( 'Plans: Create a WordPress.com Starter site as new user' ),
	function () {
		const testUser = DataHelper.getNewTestUser( { usernamePrefix: 'free' } );
		const blogName = DataHelper.getBlogName();

		let page: Page;
		let userDetails: NewUserResponse;
		let userCreatedFlag = false;
		let siteCreatedFlag = false;

		beforeAll( async function () {
			page = await browser.newPage();
		} );

		describe( 'Register as new user', function () {
			it( 'Navigate to Signup page', async function () {
				const loginPage = new LoginPage( page );
				await loginPage.visit();
				await loginPage.clickSignUp();
			} );

			it( 'Sign up as new user', async function () {
				const userSignupPage = new UserSignupPage( page );
				userDetails = await userSignupPage.signup(
					testUser.email,
					testUser.username,
					testUser.password
				);

				userCreatedFlag = true;
			} );
		} );

		describe( 'Create new site', function () {
			let cartCheckoutPage: CartCheckoutPage;

			beforeAll( async function () {
				await BrowserManager.setStoreCookie( page );
			} );

			it( 'Select a .wordpres.com domain name', async function () {
				const domainSearchComponent = new DomainSearchComponent( page );
				await domainSearchComponent.search( blogName );
				await domainSearchComponent.selectDomain( '.wordpress.com' );
			} );

			it( 'Select WordPress.com Starter plan', async function () {
				const signupPickPlanPage = new SignupPickPlanPage( page );
				await signupPickPlanPage.selectPlan( 'Starter' );

				siteCreatedFlag = true;
			} );

			it( 'See secure checkout', async function () {
				cartCheckoutPage = new CartCheckoutPage( page );
				await cartCheckoutPage.validateCartItem( 'WordPress.com Starter' );
			} );

			it( 'Enter payment details', async function () {
				const paymentDetails = DataHelper.getTestPaymentDetails();
				await cartCheckoutPage.enterBillingDetails( paymentDetails );
				await cartCheckoutPage.enterPaymentDetails( paymentDetails );
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

		describe( 'Validate WordPress.com Starter functionality', function () {
			let sidebarComponent: SidebarComponent;

			it( 'Sidebar states user is on WordPress.com Starter plan', async function () {
				sidebarComponent = new SidebarComponent( page );
				const plan = await sidebarComponent.getCurrentPlanName();
				expect( plan ).toBe( 'Starter' );
			} );

			it( 'Navigate to Upgrades > Plans', async function () {
				sidebarComponent = new SidebarComponent( page );
				await sidebarComponent.navigate( 'Upgrades', 'Plans' );
			} );

			it( 'Plans page states user is on WordPress.com Starter plan', async function () {
				const plansPage = new PlansPage( page, 'current' );
				await plansPage.clickTab( 'My Plan' );
				await plansPage.validateActivePlan( 'Starter' );
			} );
		} );

		describe( 'Cancel Plan', function () {
			it( 'View purchased upgrade details', async function () {
				const plansPage = new PlansPage( page, 'current' );
				await plansPage.clickManagePlan();
			} );

			it( 'Cancel WordPress.com Starter plan', async function () {
				const individualPurchasePage = new IndividualPurchasePage( page );
				await individualPurchasePage.cancelPurchase();
			} );
		} );

		afterAll( async function () {
			// Skip the cleanup if neither user nor site were created.
			if ( ! userCreatedFlag && ! siteCreatedFlag ) {
				return;
			}

			const restAPIClient = new RestAPIClient( {
				username: testUser.username,
				password: testUser.password,
			} );

			await apiCloseAccount( restAPIClient, {
				userID: userDetails.body.user_id,
				username: testUser.username,
				email: testUser.email,
			} );
		} );
	}
);
