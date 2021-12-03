/**
 * @group quarantined
 */

import {
	DataHelper,
	DomainSearchComponent,
	LoginPage,
	setupHooks,
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
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Signup: WordPress.com Paid' ), function () {
	const inboxId = DataHelper.config.get( 'inviteInboxId' ) as string;
	const username = `e2eflowtestingpaid${ DataHelper.getTimestamp() }`;
	const email = DataHelper.getTestEmailAddress( {
		inboxId: inboxId,
		prefix: username,
	} );
	const signupPassword = DataHelper.config.get( 'passwordForNewTestSignUps' ) as string;
	const blogName = DataHelper.getBlogName();
	const theme = 'Zoologist';

	let page: Page;
	let startSiteFlow: StartSiteFlow;
	let sidebarComponent: SidebarComponent;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( 'Signup and select plan', function () {
		const targetDomain = `${ blogName }.wordpress.com`;

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

		it( 'Select a free domain', async function () {
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
		} );

		it( 'Prices are shown in GBP', async function () {
			const cartAmount = ( await cartCheckoutPage.getCheckoutTotalAmount( {
				rawString: true,
			} ) ) as string;
			expect( cartAmount.startsWith( '£' ) ).toBe( true );
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
			const plansPage = new PlansPage( page );
			await plansPage.clickTab( 'Plans' );
			await plansPage.clickPlanActionButton( { plan: 'Personal', buttonText: 'Manage plan' } );
		} );

		it( 'Cancel and refund', async function () {
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
