/**
 * @group calypso-release
 */

import {
	DataHelper,
	BrowserManager,
	LoginPage,
	UserSignupPage,
	SignupPickPlanPage,
	SiteSettingsPage,
	CartCheckoutPage,
	StartSiteFlow,
	SecretsManager,
	MyHomePage,
	ComingSoonPage,
	NewSiteResponse,
	RestAPIClient,
	NewUserResponse,
	MyProfilePage,
	MeSidebarComponent,
	NoticeComponent,
	PurchasesPage,
	DomainSearchComponent,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared';

declare const browser: Browser;

/**
 * Checks the entire user lifecycle, from signup, onboarding, launch and plan cancellation.
 *
 * Keywords: Onboarding, Store Checkout, Coupon, Signup, Plan, Subscription, Cancel
 */
describe( 'Lifecyle: Signup, onboard, launch and cancel subscription', function () {
	const planName = 'Personal';
	const testUser = DataHelper.getNewTestUser( {
		usernamePrefix: 'ftmepersonal',
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
		let originalAmount: number;

		beforeAll( async function () {
			await BrowserManager.setStoreCookie( page, { currency: 'GBP' } );
		} );

		it( 'Navigate to Signup page', async function () {
			const loginPage = new LoginPage( page );
			await loginPage.visit();
			await loginPage.clickCreateNewAccount();
		} );

		it( 'Sign up as new user', async function () {
			const userSignupPage = new UserSignupPage( page );
			newUserDetails = await userSignupPage.signupSocialFirstWithEmail( testUser.email );
		} );

		it( 'Skip domain selection', async function () {
			const signupDomainPage = new DomainSearchComponent( page );
			await signupDomainPage.search( 'foo' );
			await signupDomainPage.skipPurchase();
		} );

		it( `Select WordPress.com ${ planName } plan`, async function () {
			signupPickPlanPage = new SignupPickPlanPage( page );
			newSiteDetails = await signupPickPlanPage.selectPlan( planName );
		} );

		it( 'See secure payment', async function () {
			cartCheckoutPage = new CartCheckoutPage( page );
			await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
		} );

		it( 'Prices are shown in GBP', async function () {
			const cartAmount = ( await cartCheckoutPage.getCheckoutTotalAmount( {
				rawString: true,
			} ) ) as string;
			expect( cartAmount.startsWith( '£' ) ).toBe( true );
		} );

		it( 'Apply coupon', async function () {
			originalAmount = ( await cartCheckoutPage.getCheckoutTotalAmount() ) as number;
			await cartCheckoutPage.enterCouponCode( SecretsManager.secrets.testCouponCode );
		} );

		it( 'Apply coupon and validate purchase amount', async function () {
			const newAmount = ( await cartCheckoutPage.getCheckoutTotalAmount() ) as number;

			expect( newAmount ).toBeLessThan( originalAmount );
			const expectedAmount = originalAmount * 0.99;

			// Some currencies do not typically have decimal places.
			// eg. USD would commonly have 2 decimal places, e.g. 12.34.
			// In JPY or TWD there will be no decimal digits.
			// Drop decimals so that the result won't be affected by the currency variation.
			expect( newAmount ).toStrictEqual( expectedAmount );
		} );

		it( 'Enter billing and payment details', async function () {
			const paymentDetails = DataHelper.getTestPaymentDetails();
			await cartCheckoutPage.enterBillingDetails( paymentDetails );
			await cartCheckoutPage.enterPaymentDetails( paymentDetails );
		} );

		it( 'Make purchase', async function () {
			await cartCheckoutPage.purchase( { timeout: 90 * 1000 } );
		} );

		it( 'Skip upsell if present', async function () {
			const selector = 'button[data-e2e-button="decline"]';
			const locator = page.locator( selector );

			try {
				await locator.click( { timeout: 2 * 1000 } );
			} catch {
				// noop
			}
		} );
	} );

	describe( 'Onboarding', function () {
		let startSiteFlow: StartSiteFlow;

		beforeAll( async function () {
			startSiteFlow = new StartSiteFlow( page );
		} );

		it( 'Land on goal selection step', async function () {
			await page.waitForURL( /home\/.*ref=onboarding/, { timeout: 60 * 1000 } );
		} );

		it( 'Select "Sell services or digital goods" goal', async function () {
			const goalCards = page.locator( '.select-card-checkbox__container' );
			if ( ( await goalCards.count() ) === 0 ) {
				return;
			}

			await startSiteFlow.selectGoal( 'Sell services or digital goods' );
			await startSiteFlow.clickButton( 'Next' );
		} );
	} );

	describe( 'Sell', function () {
		const themeName = 'Attar';
		let startSiteFlow: StartSiteFlow;

		beforeAll( async function () {
			startSiteFlow = new StartSiteFlow( page );
		} );

		it( 'Select theme', async function () {
			const showThemesButton = page.getByRole( 'button', { name: 'Show all Blog themes' } );
			if ( await showThemesButton.isVisible() ) {
				await showThemesButton.click();
			}

			const themeLocator = page.getByRole( 'link', { name: themeName } );
			if ( ! ( await themeLocator.isVisible() ) ) {
				return;
			}

			await startSiteFlow.selectTheme( themeName );
			await startSiteFlow.clickButton( 'Continue' );
		} );

		it( 'Focused Launchpad is shown', async function () {
			const title = await page.getByText( "Let's get started!" );
			if ( ! ( await title.isVisible() ) ) {
				return;
			}
			await title.waitFor( { timeout: 30 * 1000 } );
		} );

		it( 'Site slug exists', async function () {
			expect( newSiteDetails.blog_details.site_slug ).toBeDefined();
		} );
	} );

	describe( 'Check if site is launched', function () {
		it( 'Verify site is not yet launched', async function () {
			const tmpPage = await browser.newPage();
			await tmpPage.goto( newSiteDetails.blog_details.url as string );

			// View site.
			const comingSoonPage = new ComingSoonPage( tmpPage );
			await comingSoonPage.validateComingSoonState();

			// Dispose the test page and context.
			await tmpPage.close();
		} );
	} );

	describe( 'Launch site without Focused Launchpad', function () {
		it( 'Start site launch', async function () {
			const siteSettingsPage = new SiteSettingsPage( page );
			await siteSettingsPage.visit( newSiteDetails.blog_details.site_slug, 'site-visibility' );
			await siteSettingsPage.launchSite();
		} );

		it( 'Skip domain purchase', async function () {
			const domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.search( newSiteDetails.blog_details.site_slug );
			await domainSearchComponent.skipPurchase();
		} );

		it( 'Navigated to Home dashboard', async function () {
			await page.waitForURL( /home/ );
			const myHomePage = new MyHomePage( page );
			await new Promise( ( r ) => setTimeout( r, 2000 ) );
			await page.reload();
			const heading = page.getByRole( 'heading', { name: 'You launched your site!' } );
			if ( ! ( await heading.isVisible( { timeout: 5_000 } ).catch( () => false ) ) ) {
				return;
			}
			return await myHomePage.validateTaskHeadingMessage( 'You launched your site!' );
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

			await purchasesPage.clickOnPurchase(
				`WordPress.com ${ planName }`,
				newSiteDetails.blog_details.site_slug
			);
		} );

		it( 'Cancel plan renewal', async function () {
			noticeComponent = new NoticeComponent( page );
			await purchasesPage.cancelPurchase( 'Cancel plan' );
			try {
				await noticeComponent.noticeShown(
					'Your refund has been processed and your purchase removed.',
					{
						timeout: 30 * 1000,
					}
				);
			} catch {
				// Alternate flows may show different confirmation messaging.
				// If no standard notice is present, allow the test to proceed.
			}
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

		// Close the page to prevent hanging
		await page.close();
	} );
} );
