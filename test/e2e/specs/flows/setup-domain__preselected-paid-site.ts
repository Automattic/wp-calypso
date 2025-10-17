/**
 * @group calypso-release
 */

import {
	DataHelper,
	BrowserManager,
	DomainSearchComponent,
	CartCheckoutPage,
	RestAPIClient,
	NewSiteResponse,
	SignupPickPlanPage,
	UserSignupPage,
	NewUserResponse,
	NoticeComponent,
	cancelAtomicPurchaseFlow,
	MyProfilePage,
	MeSidebarComponent,
	PurchasesPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared/api-close-account';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle( 'Domain flow: Purchase a domain for a pre-selected paid site' ),
	function () {
		const planName = 'Personal';
		let page: Page;
		let selectedDomain: string;
		const testUser = DataHelper.getNewTestUser();
		let newUserDetails: NewUserResponse;
		let newSiteDetails: NewSiteResponse;

		beforeAll( async () => {
			page = await browser.newPage();
			await BrowserManager.setStoreCookie( page, { currency: 'USD' } );
		} );

		describe( 'Create a paid site', function () {
			it( 'Enter the onboarding flow', async function () {
				const flowUrl = DataHelper.getCalypsoURL( '/setup' );

				await page.goto( flowUrl );
			} );

			it( 'Sign up as a new user', async function () {
				const userSignupPage = new UserSignupPage( page );
				newUserDetails = await userSignupPage.signupSocialFirstWithEmail( testUser.email );
			} );

			it( 'Skip the domains step', async () => {
				const domainSearchComponent = new DomainSearchComponent( page );
				await domainSearchComponent.search( DataHelper.getBlogName() );
				await domainSearchComponent.skipPurchase();
			} );

			it( `Select ${ planName } plan`, async function () {
				const signupPickPlanPage = new SignupPickPlanPage( page );
				newSiteDetails = await signupPickPlanPage.selectPlan( planName );
			} );

			it( 'See plan and storage add-on at checkout', async function () {
				const cartCheckoutPage = new CartCheckoutPage( page );

				await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
			} );

			it( 'Enter billing and payment details', async function () {
				const cartCheckoutPage = new CartCheckoutPage( page );

				const paymentDetails = DataHelper.getTestPaymentDetails();
				await cartCheckoutPage.enterBillingDetails( paymentDetails );
				await cartCheckoutPage.enterPaymentDetails( paymentDetails );
			} );

			it( 'Make purchase', async function () {
				const cartCheckoutPage = new CartCheckoutPage( page );

				await cartCheckoutPage.purchase( { timeout: 90 * 1000 } );
			} );
		} );

		describe( 'Add domain to the site', function () {
			it( 'Enter the flow', async function () {
				const flowUrl = DataHelper.getCalypsoURL(
					`/setup/domain?siteSlug=${ newSiteDetails.blog_details.site_slug as string }`
				);

				await page.goto( flowUrl );
			} );

			it( 'Add the first suggestion to the cart', async function () {
				const domainSearchComponent = new DomainSearchComponent( page );
				selectedDomain = await domainSearchComponent.selectFirstSuggestion();
			} );

			it( 'Continue to next step', async function () {
				const domainSearchComponent = new DomainSearchComponent( page );
				await domainSearchComponent.continue();
			} );

			it( 'See domain at checkout', async function () {
				const cartCheckoutPage = new CartCheckoutPage( page );

				await cartCheckoutPage.validateCartItem( selectedDomain );
			} );
		} );

		describe( 'Cancel and remove plan', function () {
			it( 'Navigate to Me > Purchases', async function () {
				const mePage = new MyProfilePage( page );
				await mePage.visit();

				const meSidebarComponent = new MeSidebarComponent( page );
				await meSidebarComponent.openMobileMenu();
				await meSidebarComponent.navigate( 'Purchases' );
			} );

			it( 'View details of purchased plan and cancel plan renewal', async function () {
				const purchasesPage = new PurchasesPage( page );

				await purchasesPage.clickOnPurchase(
					`WordPress.com ${ planName }`,
					newSiteDetails.blog_details.site_slug as string
				);
				await purchasesPage.cancelPurchase( 'Cancel plan' );
			} );

			it( 'Cancel plan renewal', async function () {
				await cancelAtomicPurchaseFlow( page, {
					reason: 'Another reason…',
					customReasonText: 'E2E TEST CANCELLATION',
				} );

				const noticeComponent = new NoticeComponent( page );
				await noticeComponent.noticeShown(
					'Your refund has been processed and your purchase removed.',
					{
						timeout: 30 * 1000,
					}
				);
			} );
		} );

		afterAll( async function () {
			if ( ! newUserDetails ) {
				return;
			}

			const restAPIClient = new RestAPIClient(
				{
					username: testUser.username,
					password: testUser.password,
				},
				newUserDetails.body.bearer_token
			);

			await apiCloseAccount( restAPIClient, {
				userID: newUserDetails.body.user_id,
				username: newUserDetails.body.username,
				email: testUser.email,
			} );
		} );
	}
);
