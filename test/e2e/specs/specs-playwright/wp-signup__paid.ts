/**
 * @group calypso-release
 */

import {
	DataHelper,
	DomainSearchComponent,
	LoginPage,
	setupHooks,
	UserSignupPage,
	SignupPickPlanPage,
	BrowserManager,
	NavbarComponent,
	SidebarComponent,
	CartCheckoutPage,
	ComingSoonPage,
	GeneralSettingsPage,
	MyHomePage,
	CloseAccountFlow,
	PlansPage,
	IndividualPurchasePage,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

// Skipping while new onboarding flows are in transition and we map the new tests
describe.skip( DataHelper.createSuiteTitle( 'Signup: WordPress.com Paid' ), function () {
	const inboxId = DataHelper.config.get( 'inviteInboxId' ) as string;
	const username = `e2eflowtestingpaid${ DataHelper.getTimestamp() }`;
	const email = DataHelper.getTestEmailAddress( {
		inboxId: inboxId,
		prefix: username,
	} );
	const signupPassword = DataHelper.config.get( 'passwordForNewTestSignUps' ) as string;
	const blogName = DataHelper.getBlogName();

	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( 'Signup via /start', function () {
		const targetDomain = `${ blogName }.live`;

		let cartCheckoutPage: CartCheckoutPage;

		it( 'Navigate to Signup page', async function () {
			const loginPage = new LoginPage( page );
			await loginPage.signup();
		} );

		it( 'Set store cookie', async function () {
			await BrowserManager.setStoreCookie( page, { currency: 'GBP' } );
		} );

		it( 'Sign up as new user', async function () {
			const userSignupPage = new UserSignupPage( page );
			await userSignupPage.signup( email, username, signupPassword );
		} );

		it( 'Select a .live domain', async function () {
			const domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.search( blogName );
			await domainSearchComponent.selectDomain( targetDomain );
		} );

		it( 'Select WordPress.com Personal plan', async function () {
			const signupPickPlanPage = new SignupPickPlanPage( page );
			await signupPickPlanPage.selectPlan( 'Personal' );
		} );

		it( 'See secure payment', async function () {
			cartCheckoutPage = new CartCheckoutPage( page );
			await cartCheckoutPage.validateCartItem( 'WordPress.com Personal' );
			await cartCheckoutPage.validateCartItem( targetDomain );
		} );

		it( 'Prices are shown in GBP', async function () {
			const cartAmount = ( await cartCheckoutPage.getCheckoutTotalAmount( {
				rawString: true,
			} ) ) as string;
			expect( cartAmount.startsWith( '£' ) ).toBe( true );
		} );

		it( 'Remove domain purchase from cart', async function () {
			await cartCheckoutPage.removeCartItem( targetDomain );
		} );

		it( 'Apply coupon and validate purchase amount', async function () {
			const originalAmount = await cartCheckoutPage.getCheckoutTotalAmount();
			await cartCheckoutPage.enterCouponCode( DataHelper.config.get( 'testCouponCode' ) );
			const newAmount = await cartCheckoutPage.getCheckoutTotalAmount();

			expect( newAmount ).toBeLessThan( originalAmount );
			const expectedAmount = originalAmount * 0.99;

			// Some currencies do not typically have decimal places.
			// eg. USD would commonly have 2 decimal places, e.g. 12.34.
			// In JPY or TWD there will be no decimal digits.
			// Drop decimals so that the result won't be affected by the currency variation.
			expect( newAmount ).toStrictEqual( expectedAmount );
		} );

		it( 'Remove coupon code and validate purchase amount', async function () {
			const originalAmount = await cartCheckoutPage.getCheckoutTotalAmount();
			await cartCheckoutPage.removeCouponCode( DataHelper.config.get( 'testCouponCode' ) );
			const newAmount = await cartCheckoutPage.getCheckoutTotalAmount();
			expect( newAmount ).toBeGreaterThan( originalAmount );
		} );

		it( 'Enter billing and payment details', async function () {
			const paymentDetails = DataHelper.getTestPaymentDetails();
			await cartCheckoutPage.enterBillingDetails( paymentDetails );
			await cartCheckoutPage.enterPaymentDetails( paymentDetails );
		} );

		it( 'Make purchase', async function () {
			await cartCheckoutPage.purchase();
		} );
	} );

	describe( 'Launch site', function () {
		it( 'Navigate to Home dashboard', async function () {
			const navbarComponent = new NavbarComponent( page );
			await navbarComponent.clickMySites();
		} );

		it( 'Verify site is not yet launched', async function () {
			// Obtain a new Page in a separate BrowserContext.
			const testContext = await BrowserManager.newBrowserContext();
			const testPage = await BrowserManager.newPage( { context: testContext } );
			// TODO: make a utility to obtain the blog URL.
			await testPage.goto( `https://${ blogName }.wordpress.com` );
			// View site without logging in.
			const comingSoonPage = new ComingSoonPage( testPage );
			await comingSoonPage.validateComingSoonState();
			// Dispose the test page and context.
			await BrowserManager.closePage( testPage, { closeContext: true } );
		} );

		it( 'Start site launch', async function () {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Settings', 'General' );
			const generalSettingsPage = new GeneralSettingsPage( page );
			await generalSettingsPage.launchSite();
		} );

		it( 'Skip domain purchasse', async function () {
			const domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.clickButton( 'Skip Purchase' );
		} );

		it( 'Confirm site is launched', async function () {
			const myHomePage = new MyHomePage( page );
			await myHomePage.validateTaskHeadingMessage( 'You launched your site!' );
		} );
	} );

	describe( 'Cancel plan', function () {
		it( 'Navigate to Upgrades > Plans', async function () {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Upgrades', 'Plans' );
		} );

		it( 'Manage plan', async function () {
			const plansPage = new PlansPage( page );
			await plansPage.clickTab( 'Plans' );
			await plansPage.clickPlanActionButton( { plan: 'Personal', buttonText: 'Manage plan' } );
		} );

		it( 'Opt to cancel and refund', async function () {
			const individualPurchasePage = new IndividualPurchasePage( page );
			await individualPurchasePage.cancelPurchase();
		} );
	} );

	describe( 'Delete user account', function () {
		it( 'Close account', async function () {
			const closeAccountFlow = new CloseAccountFlow( page );
			await closeAccountFlow.closeAccount();
		} );
	} );
} );
