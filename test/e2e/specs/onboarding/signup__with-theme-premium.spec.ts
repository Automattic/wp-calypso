/**
 * Keywords: Onboarding, Store Checkout, Coupon, Signup, Plan, Subscription, Cancel
 */

import {
	BrowserManager,
	CartCheckoutPage,
	DataHelper,
	DomainSearchComponent,
	LoggedOutThemesPage,
	MeSidebarComponent,
	MyProfilePage,
	NewSiteResponse,
	NewUserResponse,
	NoticeComponent,
	PurchasesPage,
	RestAPIClient,
	SecretsManager,
	SignupPickPlanPage,
	ThemesPage,
	UserSignupPage,
	cancelAtomicPurchaseFlow,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';

test.describe(
	'Lifecycle: Premium theme signup, onboard, launch and cancel subscription',
	{ tag: [ tags.CALYPSO_RELEASE ] },
	() => {
		const planName = 'Premium';
		const testUser = DataHelper.getNewTestUser( {
			usernamePrefix: 'ftmepremium',
		} );

		let newUserDetails: NewUserResponse | undefined;
		let newSiteDetails: NewSiteResponse;
		let themeSlug: string | null = null;

		test.afterAll( async () => {
			if ( ! newUserDetails || ! newUserDetails.body.bearer_token ) {
				return;
			}
			const restAPIClient = new RestAPIClient(
				{ username: newUserDetails.body.username, password: testUser.password },
				newUserDetails.body.bearer_token
			);
			await apiCloseAccount( restAPIClient, {
				userID: newUserDetails.body.user_id,
				username: newUserDetails.body.username,
				email: testUser.email,
			} );
		} );

		// Skipped for now; can be updated once we're sure all onboarding tests will go
		// through the MSD flow. See https://github.com/Automattic/wp-calypso/pull/112586
		// and https://github.com/Automattic/wp-calypso/pull/112587.
		test.skip( 'Signup, purchase, and cancel a Premium theme plan', async ( { page } ) => {
			// Signup + purchase + atomic cancel stacks a 90s purchase timeout
			// with several 30s waits; the 120s config default is not enough.
			test.setTimeout( 240 * 1000 );

			await test.step( 'Set store cookie for USD', async () => {
				await BrowserManager.setStoreCookie( page, { currency: 'USD' } );
			} );

			await test.step( 'Navigate to Theme Showcase', async () => {
				const themesPage = new ThemesPage( page );
				await themesPage.visitShowcase();
			} );

			await test.step( 'Select a Premium theme and start signup', async () => {
				const loggedOutThemesPage = new LoggedOutThemesPage( page );
				await loggedOutThemesPage.filterBy( 'Premium' );
				themeSlug = await loggedOutThemesPage.startWithFirstTheme();
			} );

			await test.step( 'Sign up as new user', async () => {
				const userSignupPage = new UserSignupPage( page );
				newUserDetails = await userSignupPage.signupSocialFirstWithEmail( testUser.email );

				if ( ! newUserDetails.body.bearer_token ) {
					throw new Error(
						`Signup response missing bearer_token for ${ testUser.email } — account was likely not created (possible Bkismet rejection)`
					);
				}
			} );

			await test.step( 'Skip domain selection', async () => {
				const domainSearch = new DomainSearchComponent( page );
				await domainSearch.search( testUser.siteName );
				await domainSearch.skipPurchase();
			} );

			await test.step( `Select WordPress.com ${ planName } plan`, async () => {
				const signupPickPlanPage = new SignupPickPlanPage( page );
				newSiteDetails = await signupPickPlanPage.selectPlan( planName );
			} );

			await test.step( 'See secure payment', async () => {
				const cartCheckoutPage = new CartCheckoutPage( page );
				await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
			} );

			const cartCheckoutPage = new CartCheckoutPage( page );

			await test.step( 'Apply coupon', async () => {
				await cartCheckoutPage.enterCouponCode( SecretsManager.secrets.testCouponCode );
			} );

			await test.step( 'Enter billing and payment details', async () => {
				const paymentDetails = DataHelper.getTestPaymentDetails();
				await cartCheckoutPage.enterBillingDetails( paymentDetails );
				await cartCheckoutPage.enterPaymentDetails( paymentDetails );
			} );

			await test.step( 'Make purchase', async () => {
				await cartCheckoutPage.purchase( { timeout: 90 * 1000 } );
			} );

			await test.step( 'Installs theme in Marketplace thank you page', async () => {
				// Marketplace theme install can lag after purchase; bound it at 30s
				// so a stuck install fails here instead of consuming the whole test.
				await page.getByText( 'Customize this design' ).waitFor( { timeout: 30 * 1000 } );
			} );

			await test.step( 'Checks the active theme', async () => {
				const restAPIClient = new RestAPIClient(
					{ username: testUser.username, password: testUser.password },
					newUserDetails!.body.bearer_token
				);
				const theme = await restAPIClient.getActiveTheme( newSiteDetails.blog_details.blogid );
				expect( theme ).toContain( themeSlug );
			} );

			await test.step( 'Navigate to Me > Purchases', async () => {
				const mePage = new MyProfilePage( page );
				await mePage.visit();

				const meSidebarComponent = new MeSidebarComponent( page );
				await meSidebarComponent.openMobileMenu();
				await meSidebarComponent.navigate( 'Purchases' );
			} );

			await test.step( 'View details of purchased plan and cancel plan', async () => {
				const purchasesPage = new PurchasesPage( page );

				await purchasesPage.clickOnPurchase(
					`WordPress.com ${ planName }`,
					newSiteDetails.blog_details.site_slug
				);
				await purchasesPage.cancelPurchase( 'Cancel plan' );
				await cancelAtomicPurchaseFlow( page, {
					reason: 'Another reason…',
					customReasonText: 'E2E TEST CANCELLATION',
				} );
				const noticeComponent = new NoticeComponent( page );
				await noticeComponent.noticeShown(
					'Your refund has been processed and your purchase removed.',
					{ timeout: 30 * 1000 }
				);
			} );
		} );
	}
);
