/**
 * @group calypso-release
 */

import {
	DataHelper,
	BrowserManager,
	RestAPIClient,
	NewUserResponse,
	UserSignupPage,
	CartCheckoutPage,
	PlansPage,
	NoticeComponent,
	PurchasesPage,
	MyProfilePage,
	MeSidebarComponent,
	cancelAtomicPurchaseFlow,
	WPAdminSidebarComponent,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle( 'New Hosted Site Flow: Purchase a hosted site and cancel it' ),
	function () {
		const planName = 'Business';
		const testUser = DataHelper.getNewTestUser();

		let newUserDetails: NewUserResponse;
		let siteSlug: string;
		let plansPage: PlansPage;
		let cartCheckoutPage: CartCheckoutPage;
		let page: Page;

		beforeAll( async function () {
			page = await browser.newPage();
		} );

		describe( 'Purchase site', function () {
			beforeAll( async function () {
				await BrowserManager.setStoreCookie( page, { currency: 'GBP' } );
			} );

			it( 'Enter the flow', async function () {
				const flowUrl = DataHelper.getCalypsoURL( '/setup/new-hosted-site' );

				await page.goto( flowUrl );
			} );

			it( 'Sign up as a new user', async function () {
				const userSignupPage = new UserSignupPage( page );
				newUserDetails = await userSignupPage.signupSocialFirstWithEmail( testUser.email );
			} );

			it( `Pick the ${ planName } plan`, async function () {
				plansPage = new PlansPage( page );

				await plansPage.selectPlan( planName );
			} );

			it( 'See plan at checkout', async function () {
				cartCheckoutPage = new CartCheckoutPage( page );

				await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
			} );

			it( 'Enter billing and payment details', async function () {
				const paymentDetails = DataHelper.getTestPaymentDetails();
				await cartCheckoutPage.enterBillingDetails( paymentDetails );
				await cartCheckoutPage.enterPaymentDetails( paymentDetails );
			} );

			it( 'Make purchase', async function () {
				await cartCheckoutPage.purchase( { timeout: 90 * 1000 } );
			} );

			it( 'Wait for the Atomic transfer to complete', async function () {
				await page.waitForURL( /.*transferring-hosted-site.*/ );
			} );
		} );

		describe( 'View server settings', function () {
			it( 'See WP Admin', async function () {
				await page.waitForURL( /wp-admin/, {
					timeout: 180 * 1000,
				} );
			} );

			it( 'Navigate to Hosting > Site Settings', async function () {
				const wpAdminSidebarComponent = new WPAdminSidebarComponent( page );
				await wpAdminSidebarComponent.navigate( 'Hosting', 'Site Settings' );
			} );

			it( 'Navigate to Server > Server Settings', async function () {
				await page.getByRole( 'link', { name: 'Server' } ).click();
				await page.getByRole( 'heading', { name: 'Server Settings' } ).waitFor();

				const url = new URL( page.url() );
				siteSlug = url.pathname.split( '/' ).at( -1 )!;
			} );
		} );

		describe( 'Cancel and remove plan', function () {
			let noticeComponent: NoticeComponent;
			let purchasesPage: PurchasesPage;

			it( 'Navigate to Me > Purchases', async function () {
				const mePage = new MyProfilePage( page );
				await mePage.visit();

				const meSidebarComponent = new MeSidebarComponent( page );
				await meSidebarComponent.openMobileMenu();
				await meSidebarComponent.navigate( 'Purchases' );
			} );

			it( 'View details of purchased plan', async function () {
				purchasesPage = new PurchasesPage( page );

				await purchasesPage.clickOnPurchase( `WordPress.com ${ planName }`, siteSlug );
				await purchasesPage.purchaseAction( 'Cancel plan' );
			} );

			it( 'Cancel plan renewal', async function () {
				await cancelAtomicPurchaseFlow( page, {
					reason: 'Another reason…',
					customReasonText: 'E2E TEST CANCELLATION',
				} );

				noticeComponent = new NoticeComponent( page );
				await noticeComponent.noticeShown( 'You successfully canceled your purchase', {
					timeout: 30 * 1000,
				} );
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
