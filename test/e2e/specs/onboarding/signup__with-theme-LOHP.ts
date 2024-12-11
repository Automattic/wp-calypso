/**
 * @group calypso-release
 */

import {
	DataHelper,
	BrowserManager,
	DomainSearchComponent,
	UserSignupPage,
	SignupPickPlanPage,
	CartCheckoutPage,
	SecretsManager,
	NewSiteResponse,
	RestAPIClient,
	NewUserResponse,
	MyProfilePage,
	MeSidebarComponent,
	cancelPurchaseFlow,
	NoticeComponent,
	PurchasesPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared';

declare const browser: Browser;

/**
 * Checks the entire with theme user lifecycle, from signup, onboarding, launch and plan cancellation.
 *
 * Keywords: Onboarding, Store Checkout, Coupon, Signup, Plan, Subscription, Cancel
 */
describe( 'Lifecyle: Logged Out Home Page, signup, onboard, launch and cancel subscription', function () {
	const planName = 'Premium';
	let themeSlug: string | null = null;

	const testUser = DataHelper.getNewTestUser( {
		usernamePrefix: 'ftmepremium',
	} );

	let page: Page;
	let newUserDetails: NewUserResponse;
	let newSiteDetails: NewSiteResponse;

	beforeAll( async () => {
		page = await browser.newPage();
	} );

	describe( 'Signup', function () {
		let cartCheckoutPage: CartCheckoutPage;
		let signupPickPlanPage: SignupPickPlanPage;

		beforeAll( async function () {
			await BrowserManager.setStoreCookie( page, { currency: 'USD' } );
		} );

		it( 'Navigate to the Logged Out Home Page', async function () {
			await page.goto( 'https://WordPress.com' );
		} );

		it( 'Selects a theme', async function () {
			// Hovering over the container to stop the carousel scrolling
			// The force is necessary as the container is not considered stable due to the scrolling
			const themeContainer = page.locator( '.lp-content.lp-content-area--scrolling' ).first();
			await themeContainer.hover( { force: true } );

			// Hovering over the theme card is necessary to make the "Start with this theme" button visible.
			const themeCard = themeContainer.locator( '.lp-image-top-row' ).last();
			await themeCard.hover();

			const themeButton = themeCard.getByText( 'Start with this theme' );
			const calypsoUrl = new URL( DataHelper.getCalypsoURL() );
			const themeButtonUrl = new URL( ( await themeButton.getAttribute( 'href' ) ) || '' );

			if ( calypsoUrl.hostname !== 'wordpress.com' ) {
				// Reroute the click to the current Calypso URL.
				await page.route( themeButtonUrl.href, async ( route ) => {
					themeButtonUrl.host = calypsoUrl.host;
					themeButtonUrl.protocol = calypsoUrl.protocol;

					await route.abort();
					await page.goto( themeButtonUrl.href );
				} );
			}
			// Get theme slug
			const pageMatch = new URL( themeButtonUrl.href ).search.match( 'theme=([a-z]*)?&' );
			themeSlug = pageMatch?.[ 1 ] || null;

			// Hover, otherwise the element isn't considered stable, and is out of the viewport.
			await themeCard.hover();
			await themeCard.getByText( 'Start with this theme' ).click();
		} );

		it( 'Sign up as new user', async function () {
			const userSignupPage = new UserSignupPage( page );
			newUserDetails = await userSignupPage.signupSocialFirstWithEmail( testUser.email );
		} );

		it( 'Skip domain selection', async function () {
			const domainSearch = new DomainSearchComponent( page );

			await domainSearch.search( testUser.siteName );
			await domainSearch.selectDomain( `${ testUser.siteName }.wordpress.com` );
		} );

		it( `Select WordPress.com ${ planName } plan`, async function () {
			signupPickPlanPage = new SignupPickPlanPage( page );
			newSiteDetails = await signupPickPlanPage.selectPlan( planName );
		} );

		it( 'See secure payment', async function () {
			cartCheckoutPage = new CartCheckoutPage( page );
			await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
		} );

		it( 'Apply coupon', async function () {
			await cartCheckoutPage.enterCouponCode( SecretsManager.secrets.testCouponCode );
		} );

		it( 'Enter billing and payment details', async function () {
			const paymentDetails = DataHelper.getTestPaymentDetails();
			await cartCheckoutPage.enterBillingDetails( paymentDetails );
			await cartCheckoutPage.enterPaymentDetails( paymentDetails );
		} );

		it( 'Make purchase', async function () {
			await cartCheckoutPage.purchase( { timeout: 90 * 1000 } );
		} );

		it( 'Skip business plan upsell', async function () {
			const selector = 'button[data-e2e-button="decline"]';

			const locator = page.locator( selector );

			await locator.click( { timeout: 30 * 1000 } );
		} );

		it( 'Checks the active theme', async function () {
			const restAPIClient = new RestAPIClient(
				{
					username: testUser.username,
					password: testUser.password,
				},
				newUserDetails.body.bearer_token
			);

			const theme = await restAPIClient.getActiveTheme( newSiteDetails.blog_details.blogid );

			expect( theme ).toBe( `pub/${ themeSlug }` );
		} );
	} );

	describe( 'Cancel and remove plan', function () {
		let noticeComponent: NoticeComponent;
		let purchasesPage: PurchasesPage;

		it( 'Navigate to Me > Purchases', async function () {
			const mePage = new MyProfilePage( page );
			await mePage.visit();

			const meSidebarComponent = new MeSidebarComponent( page );
			await meSidebarComponent.navigate( 'Purchases' );
		} );

		it( 'View details of purchased plan', async function () {
			purchasesPage = new PurchasesPage( page );

			await purchasesPage.clickOnPurchase(
				`WordPress.com ${ planName }`,
				newSiteDetails.blog_details.site_slug
			);
			await purchasesPage.purchaseAction( 'Cancel plan' );
		} );

		it( 'Cancel plan renewal', async function () {
			await cancelPurchaseFlow( page, {
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
} );
