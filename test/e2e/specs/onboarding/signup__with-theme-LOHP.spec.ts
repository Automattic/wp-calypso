import {
	CartCheckoutPage,
	DomainSearchComponent,
	NewTestUserDetails,
	NewUserResponse,
	RestAPIClient,
	SignupPickPlanPage,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';

test.describe(
	'Signup: Lifecycle: Logged Out Home Page, signup, onboard, launch and cancel subscription',
	{
		tag: [ tags.CALYPSO_RELEASE ],
		annotation: {
			type: 'flowchart',
			description:
				'https://www.mermaidchart.com/play?utm_source=mermaid_live_editor&utm_medium=toggle#pako:eNqNk1Fr2zAQx7_KzYOywQo1SRMngz0kcTfG2Abpy2j2oEhX20yWjKXQhrHv3pNkOyFNhuQ33-__v9Od7m_CtcBknjxK_cRL1lq4X2wU0JG6bB42yTddFCjgx87CF10j_GQFbpLfcH39CZ4bS0T-3EjdItyXWKOhWNBT0ENS2xOfAPZOfTbbeNw4yzVK5B04IGbwE-cMYYWWVfK1rwjGhSHRZ7SwtnRNFANSGB_ne0bAskVmEfZ61wLjXO-UHUAiPInoyFxZbAOINSUGJkSL5tAAwjpjl3kpWVUH3DSMI2gFtkR4wi28W2lyUOa91wa1uvXiLWtJ_MvJtlIXV6zR5qMBJmtN_aBixf7NkJFgL1JT0nxndXcPJ3QjuwKV3rhSSq0NAgPh0_ah0XGokWwITFy32U7xEup979ZVOQ0Js6EhLgy2spJclACBhrdVYyutDqL0JqjSdJCFUrzE-OEf0aOOHp8psGcmHTM9162TNhHV0a7spVbKPTarwWheMXnEZR03I-4rWprbH1h7CJrjV6ayfli9Mj39MT786J_znnrktgweKynnb_N0kefTD1zTNs23knIdg26dAnfnzyXOL1KMoYn2E3GGtEcxhm6LArdYrPK7xWXORHFuzWLyqnGHLbN8spxdxG6j3NyqxVRHCxJVHK1EHDeK5CZxXBZ3C3rPcdw4kptGclnkdWf_Ga77kn8vznwxIw',
		},
	},
	() => {
		let newUserThemeSignup: NewUserResponse;
		let testUserThemeSignup: NewTestUserDetails;

		test( 'One: As a new WordPress.com user I can sign up for a new Premium plan site using a theme from the Logged Out Home Page', async ( {
			page,
			helperBrowser,
			helperData,
			environment,
			pageLoggedOutHomePage,
			pageLoggedOutThemesPage,
			pageThemeDetails,
			pageUserSignUp,
		} ) => {
			let themeSlug: string | null = null;
			const planName = 'Premium';

			testUserThemeSignup = helperData.getNewTestUser( {
				usernamePrefix: 'ftmepremium',
			} );

			await test.step( 'When I visit the logged out home page', async function () {
				await page.goto( environment.WPCOM_BASE_URL );
			} );

			await test.step( 'And I set the store cookie for USD', async function () {
				await helperBrowser.setStoreCookie( page, { currency: 'USD' } );
			} );

			await test.step( 'Then I see the logged out home page', async function () {
				await expect( pageLoggedOutHomePage.logInMenuItem ).toBeVisible();
			} );

			await test.step( 'When I select the first free theme and choose Get Started', async function () {
				await pageLoggedOutHomePage.exploreThemesLink.click();

				await pageLoggedOutThemesPage.filterBy( 'Free' );
				await pageLoggedOutThemesPage.firstThemeCard.click();

				const calypsoGetStartedLink = await pageThemeDetails.calypsoGetStartedLink();
				themeSlug = pageThemeDetails.getThemeSlugFromCalypsoGetStartedLink( calypsoGetStartedLink );
				await page.goto( calypsoGetStartedLink );
				console.log( `Selected theme slug: ${ themeSlug }` ); // to remove this when actually using it to avoid eslint errors
			} );

			await test.step( 'Then I see the "Create your account" page', async function () {
				await expect( pageUserSignUp.createYourAccountHeading ).toBeVisible();
			} );

			await test.step( 'When I sign up with my email', async function () {
				newUserThemeSignup = await pageUserSignUp.signupWithEmail( testUserThemeSignup.email );
			} );

			await test.step( 'Then I see the "Claim your space on the web" (domains) page', async function () {
				const domainSearch = new DomainSearchComponent( page );
				await expect( domainSearch.claimYourSpaceHeading ).toBeVisible();
			} );

			await test.step( 'When I search for my site name and skip domain purchase', async function () {
				const domainSearch = new DomainSearchComponent( page );

				await domainSearch.search( testUserThemeSignup.siteName );
				await domainSearch.skipPurchase();
			} );

			await test.step( 'Then I am taken to the choose your plan page', async function () {
				const signupPickPlanPage = new SignupPickPlanPage( page );
				await expect( signupPickPlanPage.theresAPlanForYouHeading ).toBeVisible();
			} );

			await test.step( `When I choose the "${ planName }" plan`, async function () {
				const signupPickPlanPage = new SignupPickPlanPage( page );
				await signupPickPlanPage.selectPlan( planName );
			} );

			await test.step( 'Then I am taken to the cart checkout page with the correct plan', async function () {
				const cartCheckoutPage = new CartCheckoutPage( page );
				await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
			} );
		} );

		test.afterAll( 'Delete all user accounts generated', async function () {
			if ( newUserThemeSignup && testUserThemeSignup ) {
				const restAPIClient = new RestAPIClient(
					{
						username: testUserThemeSignup.username,
						password: testUserThemeSignup.password,
					},
					newUserThemeSignup.body.bearer_token
				);

				await apiCloseAccount( restAPIClient, {
					userID: newUserThemeSignup.body.user_id,
					username: newUserThemeSignup.body.username,
					email: testUserThemeSignup.email,
				} );
			}
		} );
	}
);

// /**
//  * @group calypso-release
//  */

// import {
// 	DataHelper,
// 	BrowserManager,
// 	UserSignupPage,
// 	SignupPickPlanPage,
// 	CartCheckoutPage,
// 	SecretsManager,
// 	NewSiteResponse,
// 	RestAPIClient,
// 	NewUserResponse,
// 	MyProfilePage,
// 	MeSidebarComponent,
// 	NoticeComponent,
// 	PurchasesPage,
// 	envVariables,
// 	LoggedOutHomePage,
// 	LoggedOutThemesPage,
// 	ThemesDetailPage,
// 	cancelAtomicPurchaseFlow,
// 	DomainSearchComponent,
// } from '@automattic/calypso-e2e';
// import { Page, Browser } from 'playwright';
// import { apiCloseAccount } from '../shared';

// declare const browser: Browser;

// /**
//  * Checks the entire with theme user lifecycle, from signup, onboarding, launch and plan cancellation.
//  *
//  * Keywords: Onboarding, Store Checkout, Coupon, Signup, Plan, Subscription, Cancel
//  */
// describe( 'Lifecyle: Logged Out Home Page, signup, onboard, launch and cancel subscription', function () {
// 	const planName = 'Premium';
// 	let themeSlug: string | null = null;

// 	const testUser = DataHelper.getNewTestUser( {
// 		usernamePrefix: 'ftmepremium',
// 	} );

// 	let page: Page;
// 	let newUserDetails: NewUserResponse;
// 	let newSiteDetails: NewSiteResponse;

// 	beforeAll( async () => {
// 		page = await browser.newPage();
// 	} );

// 	describe( 'Signup', function () {
// 		let cartCheckoutPage: CartCheckoutPage;
// 		let signupPickPlanPage: SignupPickPlanPage;

// 		beforeAll( async function () {
// 			await BrowserManager.setStoreCookie( page, { currency: 'USD' } );
// 		} );

// 		it( 'Navigate to the Logged Out Home Page', async function () {
// 			await page.goto( 'https://WordPress.com' );
// 		} );

// 		it( 'Select a theme', async function () {
// 			const lohp = new LoggedOutHomePage( page );

// 			if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
// 				themeSlug = await lohp.selectFirstTheme();
// 				return;
// 			}

// 			await lohp.clickExploreThemes();

// 			const themeShowcase = new LoggedOutThemesPage( page );

// 			await themeShowcase.filterBy( 'Free' );
// 			await themeShowcase.clickFirstTheme();

// 			const themeDetails = new ThemesDetailPage( page );
// 			themeSlug = await themeDetails.pickThisDesign();
// 		} );

// 		it( 'Sign up as new user', async function () {
// 			const userSignupPage = new UserSignupPage( page );
// 			newUserDetails = await userSignupPage.signupSocialFirstWithEmail( testUser.email );
// 		} );

// 		it( 'Skip domain selection', async function () {
// 			const domainSearch = new DomainSearchComponent( page );

// 			await domainSearch.search( testUser.siteName );
// 			await domainSearch.skipPurchase();
// 		} );

// 		it( `Select WordPress.com ${ planName } plan`, async function () {
// 			signupPickPlanPage = new SignupPickPlanPage( page );
// 			newSiteDetails = await signupPickPlanPage.selectPlan( planName );
// 		} );

// 		it( 'See secure payment', async function () {
// 			cartCheckoutPage = new CartCheckoutPage( page );
// 			await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
// 		} );

// 		it( 'Apply coupon', async function () {
// 			await cartCheckoutPage.enterCouponCode( SecretsManager.secrets.testCouponCode );
// 		} );

// 		it( 'Enter billing and payment details', async function () {
// 			const paymentDetails = DataHelper.getTestPaymentDetails();
// 			await cartCheckoutPage.enterBillingDetails( paymentDetails );
// 			await cartCheckoutPage.enterPaymentDetails( paymentDetails );
// 		} );

// 		it( 'Make purchase', async function () {
// 			await cartCheckoutPage.purchase( { timeout: 90 * 1000 } );
// 		} );

// 		it( 'Checks the active theme', async function () {
// 			const restAPIClient = new RestAPIClient(
// 				{
// 					username: testUser.username,
// 					password: testUser.password,
// 				},
// 				newUserDetails.body.bearer_token
// 			);

// 			const theme = await restAPIClient.getActiveTheme( newSiteDetails.blog_details.blogid );

// 			expect( theme ).toBe( `pub/${ themeSlug }` );
// 		} );
// 	} );

// 	describe( 'Cancel and remove plan', function () {
// 		let noticeComponent: NoticeComponent;
// 		let purchasesPage: PurchasesPage;

// 		it( 'Navigate to Me > Purchases', async function () {
// 			const mePage = new MyProfilePage( page );
// 			await mePage.visit();

// 			const meSidebarComponent = new MeSidebarComponent( page );
// 			await meSidebarComponent.openMobileMenu();
// 			await meSidebarComponent.navigate( 'Purchases' );
// 		} );

// 		it( 'View details of purchased plan and cancel plan renewal', async function () {
// 			purchasesPage = new PurchasesPage( page );

// 			await purchasesPage.clickOnPurchase(
// 				`WordPress.com ${ planName }`,
// 				newSiteDetails.blog_details.site_slug
// 			);
// 			await purchasesPage.cancelPurchase( 'Cancel plan' );
// 		} );

// 		it( 'Cancel plan renewal', async function () {
// 			await cancelAtomicPurchaseFlow( page, {
// 				reason: 'Another reason…',
// 				customReasonText: 'E2E TEST CANCELLATION',
// 			} );

// 			noticeComponent = new NoticeComponent( page );
// 			await noticeComponent.noticeShown(
// 				'Your refund has been processed and your purchase removed.',
// 				{
// 					timeout: 30 * 1000,
// 				}
// 			);
// 		} );
// 	} );

// 	afterAll( async function () {
// 		if ( ! newUserDetails ) {
// 			return;
// 		}

// 		const restAPIClient = new RestAPIClient(
// 			{
// 				username: testUser.username,
// 				password: testUser.password,
// 			},
// 			newUserDetails.body.bearer_token
// 		);

// 		await apiCloseAccount( restAPIClient, {
// 			userID: newUserDetails.body.user_id,
// 			username: newUserDetails.body.username,
// 			email: testUser.email,
// 		} );
// 	} );
// } );
