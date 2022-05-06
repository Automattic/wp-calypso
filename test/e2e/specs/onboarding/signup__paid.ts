/**
 * @group quarantined
 */

import {
	DataHelper,
	DomainSearchComponent,
	LoginPage,
	UserSignupPage,
	SignupPickPlanPage,
	BrowserManager,
	SidebarComponent,
	CartCheckoutPage,
	CloseAccountFlow,
	PlansPage,
	IndividualPurchasePage,
	StartSiteFlow,
	ThemesPage,
	secrets,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { skipDescribeIf } from '../../jest-helpers';

declare const browser: Browser;

const isStagingOrProd = DataHelper.getCalypsoURL()
	.toLowerCase()
	.includes( 'https://wordpress.com' );

skipDescribeIf( isStagingOrProd )(
	DataHelper.createSuiteTitle( 'Signup: WordPress.com Paid' ),
	function () {
		const inboxId = secrets.mailosaur.inviteInboxId;
		const username = `e2eflowtestingpaid${ DataHelper.getTimestamp() }`;
		const email = DataHelper.getTestEmailAddress( {
			inboxId: inboxId,
			prefix: username,
		} );
		const signupPassword = secrets.passwordForNewTestSignUps;
		const blogName = DataHelper.getBlogName();
		const theme = 'Zoologist';

		let page: Page;
		let startSiteFlow: StartSiteFlow;
		let sidebarComponent: SidebarComponent;

		beforeAll( async () => {
			page = await browser.newPage();
		} );

		describe( 'Signup and select plan', function () {
			const targetDomain = `${ blogName }.live`;

			let cartCheckoutPage: CartCheckoutPage;

			it( 'Navigate to Signup page', async function () {
				const loginPage = new LoginPage( page );
				await loginPage.visit();
				await loginPage.clickSignUp();
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
				await signupPickPlanPage.selectPlan( 'Pro' );
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
				const originalAmount = ( await cartCheckoutPage.getCheckoutTotalAmount() ) as number;
				await cartCheckoutPage.enterCouponCode( secrets.testCouponCode );
				const newAmount = ( await cartCheckoutPage.getCheckoutTotalAmount() ) as number;

				expect( newAmount ).toBeLessThan( originalAmount );
				const expectedAmount = originalAmount * 0.99;

				// Some currencies do not typically have decimal places.
				// eg. USD would commonly have 2 decimal places, e.g. 12.34.
				// In JPY or TWD there will be no decimal digits.
				// Drop decimals so that the result won't be affected by the currency variation.
				expect( newAmount ).toStrictEqual( expectedAmount );
			} );

			it( 'Remove coupon code and validate purchase amount', async function () {
				const originalAmount = ( await cartCheckoutPage.getCheckoutTotalAmount() ) as number;
				await cartCheckoutPage.removeCouponCode( secrets.testCouponCode );
				const newAmount = ( await cartCheckoutPage.getCheckoutTotalAmount() ) as number;
				expect( newAmount ).toBeGreaterThan( originalAmount );
			} );

			it( 'Enter billing and payment details', async function () {
				const paymentDetails = DataHelper.getTestPaymentDetails();
				await cartCheckoutPage.enterBillingDetails( paymentDetails );
				await cartCheckoutPage.enterPaymentDetails( paymentDetails );
			} );

			it( 'Make purchase', async function () {
				await cartCheckoutPage.purchase( { timeout: 90 * 1000 } );
			} );
		} );

		describe( 'Onboarding flow', function () {
			it( 'Select "build" path', async function () {
				startSiteFlow = new StartSiteFlow( page );
				await startSiteFlow.clickButton( 'Start building' );
			} );

			it( 'Select a theme to preview', async function () {
				await startSiteFlow.previewTheme( theme );
			} );

			it( 'See site preview for the selected theme', async function () {
				const previewFrame = await startSiteFlow.getThemePreviewIframe();
				// Make sure the content actually fills in the iframe.
				// For the Zoologist theme, the word "Zoologist" is right at the top of the site content.
				// Also, that preview render can be slow, let's give it a minute to be safe.
				await previewFrame.waitForSelector( `text=${ theme }`, { timeout: 60 * 1000 } );
			} );

			it( 'Start with the selected theme and land on home dashboard', async function () {
				const navigationTimeout = 2 * 60 * 1000;
				await Promise.all( [
					page.waitForNavigation( { url: '**/home/**', timeout: navigationTimeout } ),
					startSiteFlow.clickButton( `Start with ${ theme }` ),
				] );
			} );
		} );

		describe( 'Validate selected theme', function () {
			it( 'Navigate to Appearance > Themes', async function () {
				sidebarComponent = new SidebarComponent( page );
				await sidebarComponent.navigate( 'Appearance', 'Themes' );
			} );

			it( 'Current theme is one selected in onboarding', async function () {
				const themesPage = new ThemesPage( page );
				await themesPage.validateCurrentTheme( theme );
			} );
		} );

		describe( 'Cancel plan', function () {
			it( 'Navigate to Upgrades > Plans', async function () {
				await sidebarComponent.navigate( 'Upgrades', 'Plans' );
			} );

			it( 'Manage plan', async function () {
				const plansPage = new PlansPage( page, 'legacy' );
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
	}
);
