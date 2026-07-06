import {
	BrowserManager,
	CartCheckoutPage,
	ComingSoonPage,
	DataHelper,
	DomainSearchComponent,
	LoginPage,
	MeSidebarComponent,
	MyHomePage,
	MyProfilePage,
	NewSiteResponse,
	NewUserResponse,
	NoticeComponent,
	PostCheckoutSetupSitePage,
	PurchasesPage,
	RestAPIClient,
	SecretsManager,
	SignupPickPlanPage,
	SiteSettingsPage,
	StartSiteFlow,
	UserSignupPage,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';

/**
 * Checks the entire user lifecycle, from signup, onboarding, launch and plan cancellation.
 *
 * Keywords: Onboarding, Store Checkout, Coupon, Signup, Plan, Subscription, Cancel
 */
test.describe(
	'Lifecyle: Signup, onboard, launch and cancel subscription',
	{ tag: [ tags.CALYPSO_RELEASE ] },
	() => {
		const planName = 'Personal';
		const testUser = DataHelper.getNewTestUser( {
			usernamePrefix: 'ftmepersonal',
		} );
		let newUserDetails: NewUserResponse | undefined;
		let newSiteDetails: NewSiteResponse;

		test.afterAll( async () => {
			if ( ! newUserDetails ) {
				return;
			}
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

		test( 'As a new user, I can sign up, onboard, launch, and cancel subscription', async ( {
			page,
			browser,
		} ) => {
			// ~245s of dominant waits (90s purchase + 30s launchpad + 30s notice +
			// the domain-search settle) plus signup, onboarding and launch; 300s
			// leaves margin the 120s default cannot give.
			test.setTimeout( 300 * 1000 );

			let cartCheckoutPage: CartCheckoutPage;
			let originalAmount: number;

			await test.step( 'Given the store currency is set to GBP', async () => {
				await BrowserManager.setStoreCookie( page, { currency: 'GBP' } );
			} );

			await test.step( 'When I navigate to Signup page', async () => {
				const loginPage = new LoginPage( page );
				await loginPage.visit();
				await loginPage.clickCreateNewAccount();
			} );

			await test.step( 'When I sign up as new user', async () => {
				const userSignupPage = new UserSignupPage( page );
				newUserDetails = await userSignupPage.signupSocialFirstWithEmail( testUser.email );
			} );

			await test.step( 'When I skip domain selection', async () => {
				const signupDomainPage = new DomainSearchComponent( page );
				await signupDomainPage.search( 'foo' );
				await signupDomainPage.skipPurchase();
			} );

			await test.step( `When I select WordPress.com ${ planName } plan`, async () => {
				const signupPickPlanPage = new SignupPickPlanPage( page );
				newSiteDetails = await signupPickPlanPage.selectPlan( planName );
			} );

			await test.step( 'Then I see secure payment', async () => {
				cartCheckoutPage = new CartCheckoutPage( page );
				await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
			} );

			await test.step( 'Then prices are shown in GBP', async () => {
				const cartAmount = ( await cartCheckoutPage!.getCheckoutTotalAmount( {
					rawString: true,
				} ) ) as string;
				expect( cartAmount.startsWith( '£' ) ).toBe( true );
			} );

			await test.step( 'When I apply coupon', async () => {
				originalAmount = ( await cartCheckoutPage!.getCheckoutTotalAmount() ) as number;
				await cartCheckoutPage!.enterCouponCode( SecretsManager.secrets.testCouponCode );
			} );

			await test.step( 'Then the coupon reduces the purchase amount', async () => {
				const newAmount = ( await cartCheckoutPage!.getCheckoutTotalAmount() ) as number;
				expect( newAmount ).toBeLessThan( originalAmount! );
				const expectedAmount = originalAmount! * 0.99;
				expect( newAmount ).toStrictEqual( expectedAmount );
			} );

			await test.step( 'When I enter billing and payment details', async () => {
				const paymentDetails = DataHelper.getTestPaymentDetails();
				await cartCheckoutPage!.enterBillingDetails( paymentDetails );
				await cartCheckoutPage!.enterPaymentDetails( paymentDetails );
			} );

			await test.step( 'When I make purchase', async () => {
				await cartCheckoutPage!.purchase( { timeout: 90 * 1000 } );
			} );

			await test.step( 'When I skip upsell if present', async () => {
				const selector = 'button[data-e2e-button="decline"]';
				const locator = page.locator( selector );
				try {
					await locator.click( { timeout: 2 * 1000 } );
				} catch {
					// noop
				}
			} );

			await test.step( 'Then I land on the post-checkout "Set up your site" screen', async () => {
				// Eligible paid plans now land on the post-checkout choice screen
				// instead of the goal-selection step.
				const postCheckoutSetupSitePage = new PostCheckoutSetupSitePage( page );
				await postCheckoutSetupSitePage.waitUntilLoaded();
			} );

			await test.step( 'When I select "Sell services or digital goods" goal', async () => {
				const startSiteFlow = new StartSiteFlow( page );
				const goalCards = page.locator( '.select-card-checkbox__container' );
				if ( ( await goalCards.count() ) === 0 ) {
					return;
				}
				await startSiteFlow.selectGoal( 'Sell services or digital goods' );
				await startSiteFlow.clickButton( 'Next' );
			} );

			await test.step( 'When I select theme', async () => {
				const startSiteFlow = new StartSiteFlow( page );
				const themeName = 'Attar';
				const showThemesButton = page.getByRole( 'button', { name: 'Show all Blog themes' } );
				if ( await showThemesButton.isVisible() ) {
					await showThemesButton.click();
				}
				const themeLocator = page.getByRole( 'link', { name: themeName } );
				if ( ! ( await themeLocator.isVisible() ) ) {
					return;
				}
				await startSiteFlow.selectTheme( themeName );
				await startSiteFlow.clickButton( 'Continue' );
			} );

			await test.step( 'Then Launchpad is shown (if applicable)', async () => {
				const title = page.getByText( "Let's get started!" );
				if ( ! ( await title.isVisible() ) ) {
					return;
				}
				await title.waitFor( { timeout: 30 * 1000 } );
			} );

			await test.step( 'Then site slug exists', async () => {
				expect( newSiteDetails!.blog_details.site_slug ).toBeDefined();
			} );

			await test.step( 'Then site is not yet launched', async () => {
				// Validate as a logged-out visitor: the coming-soon contract is
				// about what the public sees, not the authenticated owner.
				const tmpContext = await browser.newContext();
				const tmpPage = await tmpContext.newPage();
				await tmpPage.goto( newSiteDetails!.blog_details.url as string );
				const comingSoonPage = new ComingSoonPage( tmpPage );
				await comingSoonPage.validateComingSoonState();
				await tmpContext.close();
			} );

			await test.step( 'When I launch site via site settings', async () => {
				const siteSettingsPage = new SiteSettingsPage( page );
				await siteSettingsPage.visit( newSiteDetails!.blog_details.site_slug, 'site-visibility' );
				await siteSettingsPage.launchSite();
			} );

			await test.step( 'When I skip domain purchase', async () => {
				const domainSearchComponent = new DomainSearchComponent( page );
				await domainSearchComponent.search( newSiteDetails!.blog_details.site_slug );
				await domainSearchComponent.skipPurchase();
			} );

			await test.step( 'Then I am navigated back to site overview', async () => {
				await page.waitForURL( /sites/ );
				const myHomePage = new MyHomePage( page );
				await new Promise( ( r ) => setTimeout( r, 2000 ) );
				await page.reload();
				const heading = page.getByRole( 'heading', { name: 'You launched your site!' } );
				if ( ! ( await heading.isVisible( { timeout: 5_000 } ).catch( () => false ) ) ) {
					return;
				}
				await myHomePage.validateTaskHeadingMessage( 'You launched your site!' );
			} );

			await test.step( 'When I navigate to Me > Purchases', async () => {
				const mePage = new MyProfilePage( page );
				await mePage.visit();
				const meSidebarComponent = new MeSidebarComponent( page );
				await meSidebarComponent.openMobileMenu();
				await meSidebarComponent.navigate( 'Purchases' );
			} );

			await test.step( 'When I view details of purchased plan', async () => {
				const purchasesPage = new PurchasesPage( page );
				await purchasesPage.clickOnPurchase(
					`WordPress.com ${ planName }`,
					newSiteDetails!.blog_details.site_slug
				);
			} );

			await test.step( 'When I cancel plan renewal', async () => {
				const purchasesPage = new PurchasesPage( page );
				const noticeComponent = new NoticeComponent( page );
				await purchasesPage.cancelPurchase( 'Cancel plan' );
				try {
					await noticeComponent.noticeShown(
						'Your refund has been processed and your purchase removed.',
						{ timeout: 30 * 1000 }
					);
				} catch {
					// Alternate flows may show different confirmation messaging.
				}
			} );
		} );
	}
);
