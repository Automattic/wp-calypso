/**
 * @group calypso-release
 */

import {
	BrowserManager,
	DataHelper,
	UserSignupPage,
	CartCheckoutPage,
	SignupDomainPage,
	PlansPage,
	PluginsPage,
	NewUserResponse,
	RestAPIClient,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Plugins: Signup with a paid plugin' ), function () {
	const planName = 'eCommerce';
	const pluginSlug = 'wordpress-seo-premium';
	const pluginTitle = 'Yoast SEO Premium';
	const testUser = DataHelper.getNewTestUser( {
		usernamePrefix: 'plugin',
	} );

	let page: Page;
	let cartCheckoutPage: CartCheckoutPage;
	let newUserDetails: NewUserResponse;

	beforeAll( async () => {
		// Because many button/link selectors depend on label texts,
		// we need to make sure the locale is set to English.
		const context = await browser.newContext( { locale: 'en-US' } );
		page = await context.newPage();
	} );

	it( 'Set store cookie and locale', async function () {
		await BrowserManager.setStoreCookie( page );
	} );

	describe( 'Signup from logged-out plugins page', function () {
		it( 'Navigate to the plugin details page', async function () {
			const pluginsPage = new PluginsPage( page );
			await pluginsPage.visitPage( pluginSlug );
			await pluginsPage.clickStartOnboarding();
		} );

		it( 'Start the onboarding process', async function () {
			await page.waitForNavigation( {
				url: DataHelper.getCalypsoURL( '/start/with-plugin', { pluginSlug, period: 'MONTHLY' } ),
			} );
		} );

		it( 'Skip domain selection', async function () {
			const signupDomainPage = new SignupDomainPage( page );
			await signupDomainPage.skipDomainSelection();
		} );

		it( `Select WordPress.com ${ planName } plan`, async function () {
			const signupPlansPage = new PlansPage( page );
			await signupPlansPage.selectPlan( planName );
		} );

		it( 'Sign up for a WordPress.com account', async function () {
			const userSignupPage = new UserSignupPage( page );
			newUserDetails = await userSignupPage.signup(
				testUser.email,
				testUser.username,
				testUser.password
			);
		} );

		it( 'See secure checkout', async function () {
			cartCheckoutPage = new CartCheckoutPage( page );
			await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
		} );

		it( 'Have both the plan and the plugin in the cart', async function () {
			await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
			await cartCheckoutPage.validateCartItem( pluginTitle );
		} );

		it( 'Enter credit card details', async function () {
			await cartCheckoutPage.enterBillingDetails( DataHelper.getTestPaymentDetails() );
			await cartCheckoutPage.enterPaymentDetails( DataHelper.getTestPaymentDetails() );
		} );

		it( 'Agree the third-party privacy policy', async function () {
			await page.click( 'label[class*="CheckboxTermsWrapper"]' );
		} );

		it( 'Make purchase', async function () {
			await cartCheckoutPage.purchase();
		} );

		it( 'Post-checkout page', async function () {
			await page.waitForNavigation( {
				url: `**/thank-you/**`,
				timeout: 120 * 1000,
			} );
		} );
	} );

	describe( 'Validate the result', function () {
		it( 'Make sure the site is a .wpcomstaging.com', async function () {
			// Sometimes it takes time to update the site URL.
			await page.waitForTimeout( 3000 );

			await page.goto( DataHelper.getCalypsoURL( '/home' ) );
			await page.waitForNavigation( { url: '**/home/**' } );

			const siteUrl = page.url();
			expect( siteUrl ).toContain( '.wpcomstaging.com' );
		} );
	} );

	afterAll( async function () {
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
