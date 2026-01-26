import {
	BrowserManager,
	NewTestUserDetails,
	NewUserResponse,
	NewSiteResponse,
	RestAPIClient,
	cancelAtomicPurchaseFlow,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';

test.describe(
	'Domain flow: Purchase a domain for a pre-selected paid site',
	{
		tag: [ tags.CALYPSO_RELEASE ],
	},
	() => {
		const planName = 'Personal';
		let selectedDomain: string;
		let testUser: NewTestUserDetails;
		let newUserDetails: NewUserResponse;
		let newSiteDetails: NewSiteResponse;

		test( 'As a new user, I can create a paid site, add a domain using pre-selected site flow, then cancel the plan', async ( {
			page,
			componentDomainSearch,
			componentMeSidebar,
			componentNotice,
			helperData,
			pageCartCheckout,
			pageSignupPickPlan,
			pageUserSignUp,
			pageMyProfile,
			pagePurchases,
		} ) => {
			testUser = helperData.getNewTestUser();

			await test.step( 'When I enter the onboarding flow', async function () {
				BrowserManager.setStoreCookie( page, { currency: 'USD' } );
				await page.goto( helperData.getCalypsoURL( '/setup' ) );
			} );

			await test.step( 'And I sign up as a new user', async function () {
				newUserDetails = await pageUserSignUp.signupSocialFirstWithEmail( testUser.email );
			} );

			await test.step( 'And I skip the domains step', async function () {
				await componentDomainSearch.search( helperData.getBlogName() );
				await componentDomainSearch.skipPurchase();
			} );

			await test.step( `And I select the ${ planName } plan`, async function () {
				newSiteDetails = await pageSignupPickPlan.selectPlan( planName );
			} );

			await test.step( 'Then I see the plan at checkout', async function () {
				await pageCartCheckout.validateCartItem( `WordPress.com ${ planName }` );
			} );

			await test.step( 'When I enter billing and payment details', async function () {
				const paymentDetails = helperData.getTestPaymentDetails();
				await pageCartCheckout.enterBillingDetails( paymentDetails );
				await pageCartCheckout.enterPaymentDetails( paymentDetails );
			} );

			await test.step( 'And I make the purchase', async function () {
				await pageCartCheckout.purchase( { timeout: 90 * 1000 } );
			} );

			await test.step( 'Then I can see the dashboard with a success message', async function () {
				await componentNotice.noticeShown( `You're in! The ${ planName } Plan is now active.`, {
					timeout: 60 * 1000,
				} );
			} );

			await test.step( 'When I enter the domain flow with pre-selected site', async function () {
				await page.goto(
					helperData.getCalypsoURL(
						`/setup/domain?siteSlug=${ newSiteDetails.blog_details.site_slug as string }`
					)
				);
			} );

			await test.step( 'And I add the first suggestion to the cart', async function () {
				selectedDomain = await componentDomainSearch.selectFirstSuggestion();
			} );

			await test.step( 'And I continue to the next step', async function () {
				await componentDomainSearch.continue();
			} );

			await test.step( 'Then I see the domain at checkout', async function () {
				await pageCartCheckout.validateCartItem( selectedDomain );
			} );

			await test.step( 'And I navigate to Me > Purchases', async function () {
				await pageMyProfile.visit();
				await componentMeSidebar.openMobileMenu();
				await componentMeSidebar.navigate( 'Purchases' );
			} );

			await test.step( 'And I view details of the purchased plan', async function () {
				await pagePurchases.clickOnPurchase(
					`WordPress.com ${ planName }`,
					newSiteDetails.blog_details.site_slug as string
				);
				await pagePurchases.cancelPurchase( 'Cancel plan' );
			} );

			await test.step( 'And I cancel the plan renewal', async function () {
				await cancelAtomicPurchaseFlow( page, {
					reason: 'Another reason…',
					customReasonText: 'E2E TEST CANCELLATION',
				} );

				await componentNotice.noticeShown(
					'Your refund has been processed and your purchase removed.',
					{
						timeout: 30 * 1000,
					}
				);
			} );
		} );

		test.afterEach( 'Delete all user accounts generated', async function () {
			if ( newUserDetails && testUser ) {
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
			}
		} );
	}
);
