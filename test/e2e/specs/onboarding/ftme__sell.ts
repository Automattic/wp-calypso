/**
 * @group calypso-release
 */

import {
	DataHelper,
	BrowserManager,
	DomainSearchComponent,
	LoginPage,
	UserSignupPage,
	SignupPickPlanPage,
	GeneralSettingsPage,
	CartCheckoutPage,
	StartSiteFlow,
	SecretsManager,
	SignupDomainPage,
	MyHomePage,
	ComingSoonPage,
	NewSiteResponse,
	RestAPIClient,
	NewUserResponse,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'FTME: Sell' ), function () {
	const planName = 'Personal';
	const testUser = DataHelper.getNewTestUser( {
		usernamePrefix: 'ftmepersonal',
	} );
	const blogName = DataHelper.getBlogName();
	const blogTagLine = DataHelper.getRandomPhrase();

	let page: Page;
	let accountCreatedFlag = false;
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
			await loginPage.clickSignUp();
		} );

		it( 'Sign up as new user', async function () {
			const userSignupPage = new UserSignupPage( page );
			newUserDetails = await userSignupPage.signup(
				testUser.email,
				testUser.username,
				testUser.password
			);
			accountCreatedFlag = true;
		} );

		it( 'Skip domain selection', async function () {
			const signupDomainPage = new SignupDomainPage( page );
			await signupDomainPage.skipDomainSelection();
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

		it( 'Select "Sell" goal', async function () {
			await startSiteFlow.selectGoal( 'Sell' );
			await startSiteFlow.clickButton( 'Continue' );
		} );

		it( 'Select "Food" category', async function () {
			await startSiteFlow.enterVertical( 'Food & Drink' );
			await startSiteFlow.clickButton( 'Continue' );
		} );

		it( 'Enter blog name', async function () {
			await startSiteFlow.enterBlogName( blogName );
		} );

		it( 'Enter blog tagline', async function () {
			await startSiteFlow.enterTagline( blogTagLine );
			await startSiteFlow.clickButton( 'Continue' );
		} );
	} );

	describe( 'Sell', function () {
		const themeName = 'Dorna';
		let startSiteFlow: StartSiteFlow;

		beforeAll( async function () {
			startSiteFlow = new StartSiteFlow( page );
		} );

		// This step is only applicable if the flag themes/plugin-bundling
		// is false.
		// When the flag is turned on for all environments, delete this.
		// -mreishus 2022-09-13
		it.skip( 'Continue with simple option', async function () {
			await page.waitForURL( /.*setup\/storeFeatures.*/ );
			await startSiteFlow.clickButton( 'Continue' );
		} );

		it( 'Select theme', async function () {
			await startSiteFlow.selectTheme( themeName );
			await startSiteFlow.clickButton( `Start with ${ themeName }` );
		} );

		it( 'Land in Home dashboard', async function () {
			await page.waitForURL(
				DataHelper.getCalypsoURL( `/home/${ newSiteDetails.blog_details.site_slug }` )
			);
		} );
	} );

	describe( 'Launch site', function () {
		it( 'Verify site is not yet launched', async function () {
			const tmpPage = await browser.newPage();
			await tmpPage.goto( newSiteDetails.blog_details.url as string );

			// View site.
			const comingSoonPage = new ComingSoonPage( tmpPage );
			await comingSoonPage.validateComingSoonState();

			// Dispose the test page and context.
			await tmpPage.close();
		} );

		it( 'Start site launch', async function () {
			const generalSettingsPage = new GeneralSettingsPage( page );
			await generalSettingsPage.visit( newSiteDetails.blog_details.site_slug );
			await generalSettingsPage.launchSite();
		} );

		it( 'Skip domain purchase', async function () {
			const domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.search( newSiteDetails.blog_details.site_slug );
			await domainSearchComponent.clickButton( 'Skip Purchase' );
		} );

		it( 'Navigated to Home dashboard', async function () {
			const myHomePage = new MyHomePage( page );
			await myHomePage.validateTaskHeadingMessage( 'You launched your site!' );
		} );
	} );

	afterAll( async function () {
		if ( ! accountCreatedFlag ) {
			return;
		}

		const restAPIClient = new RestAPIClient( {
			username: testUser.username,
			password: testUser.password,
		} );

		await apiCloseAccount( restAPIClient, {
			userID: newUserDetails.body.user_id,
			username: newUserDetails.body.username,
			email: testUser.email,
		} );
	} );
} );
