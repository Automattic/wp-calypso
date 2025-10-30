import {
	NewSiteResponse,
	NewTestUserDetails,
	NewUserResponse,
	RestAPIClient,
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
				'https://www.mermaidchart.com/play?utm_source=mermaid_live_editor&utm_medium=toggle#pako:eNqNk01r3DAQhv_K4EJJoaH0FNhDD9510kNLDsmt7kErTWyzsiQsmcSE_veOPvyRJRvkk615_Iw1ev1acC2w2BVPUj_zlg0OHstaAV1St-ZPXfzSTYMC7kcHP3WPdfEXrq9_wItxVKxejNQDwmOLPVqqxVepGCCp3ZniDPRAIK23PaBEnpgFsYtKvOeCAzrWyTdKEZ2NJf4OHTw42heKBWlsqPOJEbAfkDmESY8DMM71qNwCEhFIRE9WyuEQQeypJzAhBrRra8KS2HfeS9b1EbeGcQStwLUIz3iEq4Mmg7JfNq3iR9lTZ8w4-GnQHdAtnYrdjCPWUx8_kX2rtU0bMJKpjTLNFqVfXwfM3nKpHpU0qeBEftI042-wp5VV6QMSOD0arZahxEefjc9g2NSjckvt2EnZqWatgDg7svj20j8uznA4_M75s6b31gR06lIAFjh9qXKdGtHvKt1uGseFAPZTS_km7Pc0J71WcwYnieGHgCfaze5T9b2sqpuvXFP6d0fJ-GkL-vhH7jZcl7iQ_hyhzfaJPCH9ATlCn__IleWhui0vcT74eT6b5ZtDnuc0ec6U8iynj3mONCU3xznnOesg1wjnfUWKcY47xvwDb62Kf_8B_FMB8A',
		},
	},
	() => {
		let newUserThemeSignup: NewUserResponse;
		let testUserThemeSignup: NewTestUserDetails;
		let newSiteDetails: NewSiteResponse;

		test( 'One: As a new WordPress.com user I can sign up for a new Premium plan site using a theme from the Logged Out Home Page', async ( {
			flowLOHPThemeSignup,
			helperData,
			secrets,
		} ) => {
			let themeSlug: string | null = null;
			const planName = 'Premium';

			testUserThemeSignup = helperData.getNewTestUser( {
				usernamePrefix: 'ftmepremium',
			} );

			await test.step( 'When I visit the logged out home page', async function () {
				await flowLOHPThemeSignup.loggedOutHomePage.visit();
			} );

			await test.step( 'And I set the store cookie for USD', async function () {
				await flowLOHPThemeSignup.loggedOutHomePage.setStoreCookie( 'USD' );
			} );

			await test.step( 'Then I see the logged out home page', async function () {
				await expect( flowLOHPThemeSignup.loggedOutHomePage.heading ).toBeVisible();
			} );

			await test.step( 'When I select the first free theme and choose Get Started', async function () {
				await flowLOHPThemeSignup.loggedOutHomePage.exploreThemesLink.click();

				await flowLOHPThemeSignup.loggedOutThemesPage.filterBy( 'Free' );
				await flowLOHPThemeSignup.loggedOutThemesPage.firstThemeCard.click();

				themeSlug = await flowLOHPThemeSignup.visitCalypsoGetStartedLinkForTheme();
			} );

			await test.step( 'Then I see the "Create your account" page', async function () {
				await expect( flowLOHPThemeSignup.userSignupPage.createYourAccountHeading ).toBeVisible();
			} );

			await test.step( 'When I sign up with my email', async function () {
				newUserThemeSignup = await flowLOHPThemeSignup.userSignupPage.signupWithEmail(
					testUserThemeSignup.email
				);
			} );

			await test.step( 'Then I see the "Claim your space on the web" (domains) page', async function () {
				await expect(
					flowLOHPThemeSignup.domainSearchComponent.claimYourSpaceHeading
				).toBeVisible();
			} );

			await test.step( 'When I search for my site name and skip domain purchase', async function () {
				await flowLOHPThemeSignup.domainSearchComponent.search( testUserThemeSignup.siteName );
				await flowLOHPThemeSignup.domainSearchComponent.skipPurchase();
			} );

			await test.step( 'Then I am taken to the choose your plan page', async function () {
				await expect(
					flowLOHPThemeSignup.signupPickPlanPage.theresAPlanForYouHeading
				).toBeVisible();
			} );

			await test.step( `When I choose the "${ planName }" plan`, async function () {
				newSiteDetails = await flowLOHPThemeSignup.signupPickPlanPage.selectPlan( planName );
			} );

			await test.step( 'Then I am taken to the cart checkout page with the correct plan', async function () {
				await flowLOHPThemeSignup.cartCheckoutPage.validateCartItem(
					`WordPress.com ${ planName }`
				);
			} );

			await test.step( 'When I apply a coupon code', async function () {
				await flowLOHPThemeSignup.cartCheckoutPage.enterCouponCode( secrets.testCouponCode );
			} );

			await test.step( 'Then I see the coupon code applied', async function () {
				await flowLOHPThemeSignup.cartCheckoutPage.validateCartItem(
					`Coupon: ${ secrets.testCouponCode }`
				);
			} );

			await test.step( 'When I enter billing and payment details and complete purchase', async function () {
				await flowLOHPThemeSignup.enterBillingPaymentDetailsAndPurchasePlan();
			} );

			await test.step( 'Then I see the theme details page for my new site', async function () {
				await expect( flowLOHPThemeSignup.themesDetailPage.continueButton ).toBeVisible( {
					timeout: 60000,
				} );
			} );

			await test.step( 'When I continue from the themes page', async function () {
				await flowLOHPThemeSignup.themesDetailPage.continueButton.click( {
					position: { x: 2, y: 2 }, // avoids clicking the dev icon overlay on mobile sized screens
				} );
			} );

			await test.step( 'Then I see my WordPress.com account home page', async function () {
				await expect( flowLOHPThemeSignup.myHomePage.heading ).toBeVisible( { timeout: 60000 } );
			} );

			await test.step( 'And my site is using the theme I selected at sign up', async function () {
				const restAPIClient = new RestAPIClient(
					{
						username: testUserThemeSignup.username,
						password: testUserThemeSignup.password,
					},
					newUserThemeSignup.body.bearer_token
				);
				const theme = await restAPIClient.getActiveTheme( newSiteDetails.blog_details.blogid );
				expect( theme ).toBe( `pub/${ themeSlug }` );
			} );

			await test.step( 'When I cancel my plan from the purchases page', async function () {
				await flowLOHPThemeSignup.purchasesPage.visit();

				await flowLOHPThemeSignup.purchasesPage.clickOnPurchase(
					`WordPress.com ${ planName }`,
					newSiteDetails.blog_details.site_slug
				);
				await flowLOHPThemeSignup.purchasesPage.cancelPurchase( 'Cancel plan' );
			} );

			await test.step( 'And I confirm the cancellation', async function () {
				await flowLOHPThemeSignup.cancelPlanPurchase();
			} );

			await test.step( 'Then I see a cancellation confirmation notice', async function () {
				await flowLOHPThemeSignup.noticeComponent.noticeShown(
					'Your refund has been processed and your purchase removed.',
					{
						timeout: 30000,
					}
				);
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
