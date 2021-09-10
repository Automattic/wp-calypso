/**
 * @group calypso-release
 */

import {
	DataHelper,
	DomainSearchComponent,
	GutenbergEditorPage,
	LoginPage,
	NewPostFlow,
	setupHooks,
	UserSignupPage,
	SignupPickPlanPage,
	AccountSettingsPage,
	AccountClosedPage,
	BrowserManager,
	EmailClient,
	NavbarComponent,
	MeSidebarComponent,
	SidebarComponent,
	PlansPage,
	BrowserHelper,
	CartCheckoutPage,
	IndividualPurchasePage,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Signup: WordPress.com Paid' ), function () {
	const inboxId = DataHelper.config.get( 'inviteInboxId' ) as string;
	const username = `e2eflowtestingeditor${ DataHelper.getTimestamp() }`;
	const email = DataHelper.getTestEmailAddress( {
		inboxId: inboxId,
		prefix: username,
	} );
	const signupPassword = DataHelper.config.get( 'passwordForNewTestSignUps' ) as string;
	const blogName = DataHelper.getBlogName();

	let page: Page;
	let domainSearchComponent: DomainSearchComponent;
	let gutenbergEditorPage: GutenbergEditorPage;

	console.log( username );
	console.log( signupPassword );
	console.log( email );
	console.log( blogName );
	console.log( inboxId );

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( 'Signup via /start', function () {
		const targetDomain = `${ blogName }.com`;

		let cartCheckoutPage: CartCheckoutPage;

		it( 'Navigate to Signup page', async function () {
			// const loginPage = new LoginPage( page );
			// await loginPage.clickSignup();

			await page.goto( DataHelper.getCalypsoURL( 'log-in' ) );
			const loginPage = new LoginPage( page );
			await loginPage.login( {
				username: 'e2eflowtestingeditor1631637216551',
				password: '80s9n3AF7BBaxAABWhNYOU2E5DVkY5',
			} );
			await page.waitForTimeout( 3000 );
			await page.goto(
				'https://wordpress.com/checkout/e2eflowtesting1631637216551868.wordpress.com'
			);
		} );

		it( 'Set store cookie', async function () {
			await BrowserManager.setStoreCookie( page, { currency: 'GBP' } );
		} );

		it( 'Sign up as new user', async function () {
			const userSignupPage = new UserSignupPage( page );
			await userSignupPage.signup( email, username, signupPassword );
			await page.pause();
		} );

		it( 'Select a .com domain', async function () {
			domainSearchComponent = new DomainSearchComponent( page );
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
			// await cartCheckoutPage.validateCartItem( targetDomain );
		} );

		it( 'Prices are shown with expected currency symbol', async function () {
			const buttonText = await cartCheckoutPage.getPaymentButtonText();
			await buttonText.startsWith( '£' );
		} );

		it( 'Remove domain purchase from cart', async function () {
			await cartCheckoutPage.removeCartItem( targetDomain );
		} );

		it( 'Apply coupon and validate resulting purchase amount', async function () {
			const originalAmount = await cartCheckoutPage.getCheckoutTotalAmount();
			await cartCheckoutPage.enterCouponCode();
			const newAmount = await cartCheckoutPage.getCheckoutTotalAmount();

			expect( newAmount ).toBeLessThan( originalAmount );
			const expectedAmount = originalAmount * 0.99;

			// Some currencies do not typically have decimal places.
			// eg. USD would commonly have 2 decimal places, e.g. 12.34.
			// In JPY or TWD there will be no decimal digits.
			// Drop decimals so that the result won't be affected by the currency variation.
			expect( Math.floor( newAmount ) ).toStrictEqual( Math.floor( expectedAmount ) );
		} );

		it( 'Enter billing and payment details', async function () {
			const paymentDetails = DataHelper.getTestPaymentDetails( 'Visa' );
			await cartCheckoutPage.enterBillingDetails( paymentDetails );
			await page.pause();
			await cartCheckoutPage.enterPaymentDetails( paymentDetails );
		} );

		it( 'Make purchase', async function () {
			await cartCheckoutPage.purchase();
		} );

		it( 'Decline Quickstart session', async function () {
			// No dedicated page object for this screen at this time.
			await page.click( 'button[data-e2e-button="decline"]' );
		} );

		it( 'Confirm plan is purchased', async function () {
			// No dedicated page object for this screen at this time.
			await page.waitForSelector( 'h2:has-text("WordPress.com Personal plan")' );
		} );
	} );

	describe( 'Cancel plan', function () {
		it( 'Navigate to Home dashboard', async function () {
			const navbarComponent = new NavbarComponent( page );
			await navbarComponent.clickMySites();
		} );

		it( 'Navigate to Upgrades > Plans', async function () {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Upgrades', 'Plans' );
		} );
	} );

	// describe( 'Interact', function () {
	// 	it( 'Start a new post', async function () {
	// 		const newPostFlow = new NewPostFlow( page );
	// 		await newPostFlow.newPostFromNavbar();
	// 	} );

	// 	it( 'Enter post title', async function () {
	// 		gutenbergEditorPage = new GutenbergEditorPage( page );
	// 		const title = DataHelper.getRandomPhrase();
	// 		await gutenbergEditorPage.enterTitle( title );
	// 	} );

	// 	it( 'Publish post', async function () {
	// 		await gutenbergEditorPage.publish( { visit: false } );
	// 	} );

	// 	it( 'Return to Home dashboard', async function () {
	// 		// Temporary workaround due to https://github.com/Automattic/wp-calypso/issues/51162.
	// 		// Conditional can be removed once fixed.
	// 		if ( BrowserHelper.getTargetDeviceName() === 'mobile' ) {
	// 			await page.goBack();
	// 		} else {
	// 			await gutenbergEditorPage.toggleSidebar();
	// 			await gutenbergEditorPage.returnToDashboard();
	// 		}
	// 	} );
	// } );

	// describe( 'Magic link', function () {
	// 	let magicLink: string;

	// 	it( 'Clear authenticated state', async function () {
	// 		await BrowserManager.clearAuthenticationState( page );
	// 	} );

	// 	it( 'Request magic link', async function () {
	// 		const loginPage = new LoginPage( page );
	// 		await loginPage.visit();
	// 		await loginPage.requestMagicLink( email );
	// 	} );

	// 	it( 'Magic link is received', async function () {
	// 		const emailClient = new EmailClient();
	// 		const message = await emailClient.getLastEmail( {
	// 			inboxId: inboxId,
	// 			emailAddress: email,
	// 			subject: 'Log in to WordPress.com',
	// 		} );
	// 		const links = await emailClient.getLinksFromMessage( message );
	// 		magicLink = links.find( ( link: string ) => link.includes( 'wpcom_email_click' ) ) as string;
	// 		expect( magicLink ).toBeDefined();
	// 	} );

	// 	it( 'Log in using magic link', async function () {
	// 		const loginPage = new LoginPage( page );
	// 		await loginPage.followMagicLink( magicLink );
	// 	} );
	// } );

	// describe( 'Delete user account', function () {
	// 	it( 'Navigate to Me > Account Settings', async function () {
	// 		const navbarComponent = new NavbarComponent( page );
	// 		await navbarComponent.clickMe();
	// 		const meSidebarComponent = new MeSidebarComponent( page );
	// 		await meSidebarComponent.navigate( 'Account Settings' );
	// 	} );

	// 	it( 'Delete user account', async function () {
	// 		const accountSettingsPage = new AccountSettingsPage( page );
	// 		await accountSettingsPage.closeAccount();
	// 	} );

	// 	it( 'Confirm account is closed', async function () {
	// 		const accountClosedPage = new AccountClosedPage( page );
	// 		await accountClosedPage.confirmAccountClosed();
	// 	} );
	// } );
} );
