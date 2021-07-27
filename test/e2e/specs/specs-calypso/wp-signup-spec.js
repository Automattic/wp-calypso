// eslint-disable-next-line
import assert from 'assert';
import config from 'config';
import { By } from 'selenium-webdriver';
import FindADomainComponent from '../../lib/components/find-a-domain-component.js';
import NavBarComponent from '../../lib/components/nav-bar-component';
import NewUserRegistrationUnavailableComponent from '../../lib/components/new-user-domain-registration-unavailable-component';
import NoSitesComponent from '../../lib/components/no-sites-component';
import SecurePaymentComponent from '../../lib/components/secure-payment-component.js';
import SidebarComponent from '../../lib/components/sidebar-component';
import * as dataHelper from '../../lib/data-helper.js';
import * as driverHelper from '../../lib/driver-helper.js';
import * as driverManager from '../../lib/driver-manager.js';
import EmailClient from '../../lib/email-client.js';
import DeleteAccountFlow from '../../lib/flows/delete-account-flow';
import DeletePlanFlow from '../../lib/flows/delete-plan-flow';
import GutenboardingFlow from '../../lib/flows/gutenboarding-flow';
import SignUpStep from '../../lib/flows/sign-up-step';
import GutenbergEditorComponent from '../../lib/gutenberg/gutenberg-editor-component';
import AccountSettingsPage from '../../lib/pages/account/account-settings-page';
import CancelDomainPage from '../../lib/pages/cancel-domain-page';
import CancelPurchasePage from '../../lib/pages/cancel-purchase-page';
import CustomerHomePage from '../../lib/pages/customer-home-page';
import DomainDetailsPage from '../../lib/pages/domain-details-page';
import DomainOnlySettingsPage from '../../lib/pages/domain-only-settings-page';
import NewPage from '../../lib/pages/gutenboarding/new-page';
import LoginPage from '../../lib/pages/login-page';
import MagicLoginPage from '../../lib/pages/magic-login-page';
import MyHomePage from '../../lib/pages/my-home-page';
import ReaderPage from '../../lib/pages/reader-page';
import SettingsPage from '../../lib/pages/settings-page';
import AboutPage from '../../lib/pages/signup/about-page.js';
import CheckOutPage from '../../lib/pages/signup/checkout-page';
import CreateYourAccountPage from '../../lib/pages/signup/create-your-account-page.js';
import DomainFirstPage from '../../lib/pages/signup/domain-first-page';
import PickAPlanPage from '../../lib/pages/signup/pick-a-plan-page.js';
import ReaderLandingPage from '../../lib/pages/signup/reader-landing-page';
import SiteTitlePage from '../../lib/pages/signup/site-title-page';
import SiteTypePage from '../../lib/pages/signup/site-type-page';
import StartPage from '../../lib/pages/signup/start-page.js';
import WPHomePage from '../../lib/pages/wp-home-page.js';
import * as sharedSteps from '../../lib/shared-steps/wp-signup-spec';
import * as SlackNotifier from '../../lib/slack-notifier';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const signupInboxId = config.get( 'signupInboxId' );
const host = dataHelper.getJetpackHost();
const locale = driverManager.currentLocale();
const passwordForTestAccounts = config.get( 'passwordForNewTestSignUps' );
const sandboxCookieValue = config.get( 'storeSandboxCookieValue' );

describe( `[${ host }] Sign Up  (${ screenSize }, ${ locale })`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Sign up for a free WordPress.com site from the Jetpack new site page, and log in via a magic link @signup @email', function () {
		const blogName = dataHelper.getNewBlogName();
		// const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
		let magicLoginLink;

		before( async function () {
			return await driverManager.ensureNotLoggedIn( this.driver );
		} );

		it( 'Can create a new WordPress site', async function () {
			await StartPage.Visit( this.driver, StartPage.getStartURL() );
		} );

		it( 'Can see the account page and enter account details', async function () {
			const createYourAccountPage = await CreateYourAccountPage.Expect( this.driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				blogName,
				passwordForTestAccounts
			);
		} );

		it( 'Can then see the domains page, and Can search for a blog name, can see and select a free .wordpress address in the results', async function () {
			const findADomainComponent = await FindADomainComponent.Expect( this.driver );
			await findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
			// See https://github.com/Automattic/wp-calypso/pull/38641/
			// await findADomainComponent.checkAndRetryForFreeBlogAddresses(
			// 	expectedBlogAddresses,
			// 	blogName
			// );
			// const actualAddress = await findADomainComponent.freeBlogAddress();
			// assert(
			// 	expectedBlogAddresses.indexOf( actualAddress ) > -1,
			// 	`The displayed free blog address: '${ actualAddress }' was not the expected addresses: '${ expectedBlogAddresses }'`
			// );
			return await findADomainComponent.selectFreeAddress();
		} );

		it( 'Can see the plans page and pick the free plan', async function () {
			const pickAPlanPage = await PickAPlanPage.Expect( this.driver );
			return await pickAPlanPage.selectFreePlan();
		} );

		it( 'Can then see the sign up processing page which will finish automatically move along', async function () {
			return await new SignUpStep( this.driver ).continueAlong( blogName, passwordForTestAccounts );
		} );

		sharedSteps.canSeeTheOnboardingChecklist();

		it( 'Can log out and request a magic link', async function () {
			if ( process.env.HORIZON_TESTS === 'true' ) {
				return this.skip();
			}
			await driverManager.ensureNotLoggedIn( this.driver );
			const loginPage = await LoginPage.Visit( this.driver );
			return await loginPage.requestMagicLink( emailAddress );
		} );

		it( 'Can see email containing magic link', async function () {
			if ( process.env.HORIZON_TESTS === 'true' ) {
				return this.skip();
			}
			const emailClient = new EmailClient( signupInboxId );
			const validator = ( emails ) =>
				emails.find( ( email ) => email.subject.includes( 'WordPress.com' ) );
			const emails = await emailClient.pollEmailsByRecipient( emailAddress, validator );
			assert.strictEqual(
				emails.length,
				2,
				'The number of newly registered emails is not equal to 2 (activation and magic link)'
			);
			for ( const email of emails ) {
				if ( email.subject.includes( 'WordPress.com' ) ) {
					return ( magicLoginLink = email.html.links[ 0 ].href );
				}
			}
			return assert(
				magicLoginLink !== undefined,
				'Could not locate the magic login link email link'
			);
		} );

		it( 'Can visit the magic link and we should be logged in', async function () {
			if ( process.env.HORIZON_TESTS === 'true' ) {
				return this.skip();
			}
			await this.driver.get( magicLoginLink );
			const magicLoginPage = await MagicLoginPage.Expect( this.driver );
			await magicLoginPage.finishLogin();
			try {
				await CustomerHomePage.Expect( this.driver );
			} catch ( e ) {
				await ReaderPage.Expect( this.driver );
			}
		} );

		after( 'Can delete our newly created account', async function () {
			return await new DeleteAccountFlow( this.driver ).deleteAccount( blogName );
		} );
	} );

	describe( 'Sign up for a free site, see the site preview, activate email and can publish @signup', function () {
		const blogName = dataHelper.getNewBlogName();
		// const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );

		before( async function () {
			return await driverManager.ensureNotLoggedIn( this.driver );
		} );

		it( 'Can visit the start page', async function () {
			await StartPage.Visit( this.driver, StartPage.getStartURL( { culture: locale } ) );
		} );

		it( 'Can see the account page and enter account details', async function () {
			const createYourAccountPage = await CreateYourAccountPage.Expect( this.driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				blogName,
				passwordForTestAccounts
			);
		} );

		it( 'Can then see the domains page, and Can search for a blog name, can see and select a free .wordpress address in the results', async function () {
			const findADomainComponent = await FindADomainComponent.Expect( this.driver );
			await findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
			// See https://github.com/Automattic/wp-calypso/pull/38641/
			// await findADomainComponent.checkAndRetryForFreeBlogAddresses(
			// 	expectedBlogAddresses,
			// 	blogName
			// );
			// const actualAddress = await findADomainComponent.freeBlogAddress();
			// assert(
			// 	expectedBlogAddresses.indexOf( actualAddress ) > -1,
			// 	`The displayed free blog address: '${ actualAddress }' was not the expected addresses: '${ expectedBlogAddresses }'`
			// );
			return await findADomainComponent.selectFreeAddress();
		} );

		it( 'Can see the plans page and pick the free plan', async function () {
			const pickAPlanPage = await PickAPlanPage.Expect( this.driver );
			return await pickAPlanPage.selectFreePlan();
		} );

		it( 'Can then see the sign up processing page which will finish automatically move along', async function () {
			return await new SignUpStep( this.driver ).continueAlong( blogName, passwordForTestAccounts );
		} );

		sharedSteps.canSeeTheOnboardingChecklist();

		after( 'Can delete our newly created account', async function () {
			return await new DeleteAccountFlow( this.driver ).deleteAccount( blogName );
		} );
	} );

	describe( 'Sign up for a non-blog site on a premium paid plan through main flow using a coupon @signup @visdiff', function () {
		const blogName = dataHelper.getNewBlogName();
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
		let originalCartAmount;

		before( async function () {
			return await driverManager.ensureNotLoggedIn( this.driver );
		} );

		it( 'Can visit the start page', async function () {
			await StartPage.Visit(
				this.driver,
				StartPage.getStartURL( { flow: 'main', culture: locale } )
			);
		} );

		it( 'Can see the account page and enter account details', async function () {
			const createYourAccountPage = await CreateYourAccountPage.Expect( this.driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				blogName,
				passwordForTestAccounts
			);
		} );

		it( 'Can see the "About" page, and enter some site information', async function () {
			const aboutPage = await AboutPage.Expect( this.driver );
			return await aboutPage.enterSiteDetails( blogName, '', {
				showcase: true,
			} );
		} );

		it( 'Can accept defaults for about page', async function () {
			const aboutPage = await AboutPage.Expect( this.driver );
			await aboutPage.submitForm();
		} );

		it( 'Can then see the domains page ', async function () {
			const findADomainComponent = await FindADomainComponent.Expect( this.driver );
			const displayed = await findADomainComponent.displayed();
			return assert.strictEqual( displayed, true, 'The choose a domain page is not displayed' );
		} );

		it( 'Can search for a blog name, can see and select a free WordPress.com blog address in results', async function () {
			return await new SignUpStep( this.driver ).selectFreeWordPressDotComAddresss(
				blogName,
				expectedBlogAddresses
			);
		} );

		it( 'Can then see the plans page and select the premium plan ', async function () {
			const pickAPlanPage = await PickAPlanPage.Expect( this.driver );
			const displayed = await pickAPlanPage.displayed();
			assert.strictEqual( displayed, true, 'The pick a plan page is not displayed' );
			return await pickAPlanPage.selectPremiumPlan();
		} );

		it( 'Can then see the sign up processing page which will automatically move along', async function () {
			return await new SignUpStep( this.driver ).continueAlong( blogName, passwordForTestAccounts );
		} );

		it( 'Can then see the secure payment page with the premium plan in the cart', async function () {
			const securePaymentComponent = await SecurePaymentComponent.Expect( this.driver );
			const premiumPlanInCart = await securePaymentComponent.containsPremiumPlan();
			assert.strictEqual( premiumPlanInCart, true, "The cart doesn't contain the premium plan" );
			const numberOfProductsInCart = await securePaymentComponent.numberOfProductsInCart();
			return assert.strictEqual(
				numberOfProductsInCart,
				1,
				"The cart doesn't contain the expected number of products"
			);
		} );

		it( 'Can Correctly Apply Coupon discount', async function () {
			const securePaymentComponent = await SecurePaymentComponent.Expect( this.driver );
			await securePaymentComponent.toggleCartSummary();
			originalCartAmount = await securePaymentComponent.cartTotalAmount();

			await securePaymentComponent.enterCouponCode( dataHelper.getTestCouponCode() );

			const newCartAmount = await securePaymentComponent.cartTotalAmount();
			const expectedCartAmount = originalCartAmount * 0.99;

			// The HTML element that cartTotalAmount() parses is rounded to different decimal level depended on the currency.
			// For example, in USD it would be 2, e.g. 12.34. In JPY or TWD there will be no decimal digits.
			// Thus we are dropping them to do comparison here so that the result won't be affected by the currency.
			assert.strictEqual(
				Math.floor( newCartAmount ),
				Math.floor( expectedCartAmount ),
				'Coupon not applied properly'
			);
		} );

		it( 'Can Remove Coupon', async function () {
			const securePaymentComponent = await SecurePaymentComponent.Expect( this.driver );

			await securePaymentComponent.removeCoupon();

			const removedCouponAmount = await securePaymentComponent.cartTotalAmount();
			assert.strictEqual( removedCouponAmount, originalCartAmount, 'Coupon not removed properly' );
		} );

		after( 'Can delete our newly created account', async function () {
			return await new DeleteAccountFlow( this.driver ).deleteAccount( blogName );
		} );
	} );

	describe( 'Sign up for a site on a personal paid plan coming in via /create as personal flow in GBP currency @signup', function () {
		const blogName = dataHelper.getNewBlogName();
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
		const currencyValue = 'GBP';
		const expectedCurrencySymbol = '£';

		before( async function () {
			return await driverManager.ensureNotLoggedIn( this.driver );
		} );

		it( 'We can set the sandbox cookie for payments', async function () {
			const wPHomePage = await WPHomePage.Visit( this.driver );
			await wPHomePage.checkURL( locale );
			await wPHomePage.setSandboxModeForPayments( sandboxCookieValue );
			return await wPHomePage.setCurrencyForPayments( currencyValue );
		} );

		it( 'Can visit the start page', async function () {
			await StartPage.Visit(
				this.driver,
				StartPage.getStartURL( { culture: locale, flow: 'personal' } )
			);
		} );

		it( 'Can see the account details page and enter account details', async function () {
			const createYourAccountPage = await CreateYourAccountPage.Expect( this.driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				blogName,
				passwordForTestAccounts
			);
		} );

		it( 'Can then see the domains page and can search for a blog name, can see and select a free WordPress.com blog address in results', async function () {
			return await new SignUpStep( this.driver ).selectFreeWordPressDotComAddresss(
				blogName,
				expectedBlogAddresses
			);
		} );

		it( 'Can then see the sign up processing page which will finish automatically move along', async function () {
			return await new SignUpStep( this.driver ).continueAlong( blogName, passwordForTestAccounts );
		} );

		it( 'Can then see the secure payment page with the expected currency in the cart', async function () {
			const securePaymentComponent = await SecurePaymentComponent.Expect( this.driver );
			if ( driverManager.currentScreenSize() === 'desktop' ) {
				const totalShown = await securePaymentComponent.cartTotalDisplayed();
				assert.strictEqual(
					totalShown.indexOf( expectedCurrencySymbol ),
					0,
					`The cart total '${ totalShown }' does not begin with '${ expectedCurrencySymbol }'`
				);
			}
			const paymentButtonText = await securePaymentComponent.paymentButtonText();
			return assert(
				paymentButtonText.includes( expectedCurrencySymbol ),
				`The payment button text '${ paymentButtonText }' does not contain the expected currency symbol: '${ expectedCurrencySymbol }'`
			);
		} );

		it( 'Can then see the secure payment page with the expected products in the cart', async function () {
			const securePaymentComponent = await SecurePaymentComponent.Expect( this.driver );
			const personalPlanInCart = await securePaymentComponent.containsPersonalPlan();
			assert.strictEqual( personalPlanInCart, true, "The cart doesn't contain the personal plan" );
			const numberOfProductsInCart = await securePaymentComponent.numberOfProductsInCart();
			return assert.strictEqual(
				numberOfProductsInCart,
				1,
				"The cart doesn't contain the expected number of products"
			);
		} );

		it( 'Can submit test payment details', async function () {
			const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
			const securePaymentComponent = await SecurePaymentComponent.Expect( this.driver );
			await securePaymentComponent.completeTaxDetailsInContactSection( testCreditCardDetails );
			await securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
			await securePaymentComponent.submitPaymentDetails();
			return await securePaymentComponent.waitForPageToDisappear();
		} );

		sharedSteps.canSeeTheOnboardingChecklist();

		it( 'Can delete the plan', async function () {
			return await new DeletePlanFlow( this.driver ).deletePlan( 'personal' );
		} );

		after( 'Can delete our newly created account', async function () {
			return await new DeleteAccountFlow( this.driver ).deleteAccount( blogName );
		} );
	} );

	describe( 'Sign up for a domain only purchase coming in from wordpress.com/domains in EUR currency @signup', function () {
		const siteName = dataHelper.getNewBlogName();
		const expectedDomainName = `${ siteName }.live`;
		const emailAddress = dataHelper.getEmailAddress( siteName, signupInboxId );
		const testDomainRegistarDetails = dataHelper.getTestDomainRegistarDetails( emailAddress );
		const currencyValue = 'EUR';
		const expectedCurrencySymbol = '€';

		before( async function () {
			if ( process.env.SKIP_DOMAIN_TESTS === 'true' ) {
				await SlackNotifier.warn(
					'Domains tests are currently disabled as SKIP_DOMAIN_TESTS is set to true',
					{ suppressDuplicateMessages: true }
				);
				return this.skip();
			}
		} );

		before( async function () {
			return await driverManager.ensureNotLoggedIn( this.driver );
		} );

		it( 'We can visit set the sandbox cookie for payments', async function () {
			const wPHomePage = await WPHomePage.Visit( this.driver );
			await wPHomePage.checkURL( locale );
			await wPHomePage.setSandboxModeForPayments( sandboxCookieValue );
			return await wPHomePage.setCurrencyForPayments( currencyValue );
		} );

		it( 'Can visit the domains start page', async function () {
			await StartPage.Visit(
				this.driver,
				StartPage.getStartURL( {
					culture: locale,
					flow: 'domain-first',
					query: `new=${ expectedDomainName }`,
				} )
			);
		} );

		it( 'Can select domain only from the domain first choice page', async function () {
			const domainFirstPage = await DomainFirstPage.Expect( this.driver );
			return await domainFirstPage.chooseJustBuyTheDomain();
		} );

		it( 'Can then enter account details', async function () {
			const createYourAccountPage = await CreateYourAccountPage.Expect( this.driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				siteName,
				passwordForTestAccounts
			);
		} );

		it( 'Can then see the sign up processing page which will finish automatically move along', async function () {
			return await new SignUpStep( this.driver ).continueAlong( siteName, passwordForTestAccounts );
		} );

		it( 'Can see checkout page and enter registrar details', async function () {
			let checkOutPage;
			try {
				checkOutPage = await CheckOutPage.Expect( this.driver );
			} catch ( err ) {
				//TODO: Check this code once more when domain registration is not available
				if (
					await driverHelper.isElementEventuallyLocatedAndVisible(
						this.driver,
						By.css( '.empty-content' )
					)
				) {
					await SlackNotifier.warn(
						"OOPS! Something went wrong, you don't have a site! Check if domains registrations is available."
					);
					return this.skip();
				}
			}
			await checkOutPage.enterRegistrarDetails( testDomainRegistarDetails );
			return await checkOutPage.submitForm();
		} );

		it( 'Can then see the secure payment page with the correct products in the cart', async function () {
			const securePaymentComponent = await SecurePaymentComponent.Expect( this.driver );
			const domainInCart = await securePaymentComponent.containsDotLiveDomain();
			assert.strictEqual( domainInCart, true, "The cart doesn't contain the .live domain product" );
			const numberOfProductsInCart = await securePaymentComponent.numberOfProductsInCart();
			return assert.strictEqual(
				numberOfProductsInCart,
				1,
				"The cart doesn't contain the expected number of products"
			);
		} );

		it( 'Can then see the secure payment page with the expected currency in the cart', async function () {
			const securePaymentComponent = await SecurePaymentComponent.Expect( this.driver );
			if ( driverManager.currentScreenSize() === 'desktop' ) {
				const totalShown = await securePaymentComponent.cartTotalDisplayed();
				assert.strictEqual(
					totalShown.indexOf( expectedCurrencySymbol ),
					0,
					`The cart total '${ totalShown }' does not begin with '${ expectedCurrencySymbol }'`
				);
			}
			const paymentButtonText = await securePaymentComponent.paymentButtonText();
			return assert(
				paymentButtonText.includes( expectedCurrencySymbol ),
				`The payment button text '${ paymentButtonText }' does not contain the expected currency symbol: '${ expectedCurrencySymbol }'`
			);
		} );

		it( 'Can enter/submit test payment details', async function () {
			const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
			const securePaymentComponent = await SecurePaymentComponent.Expect( this.driver );
			// No need to fill out contact details here as they already have been completed
			await securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
			await securePaymentComponent.submitPaymentDetails();
			await securePaymentComponent.waitForCreditCardPaymentProcessing();
			return await securePaymentComponent.waitForPageToDisappear();
		} );

		it( 'Can open the sidebar', async function () {
			const navBarComponent = await NavBarComponent.Expect( this.driver );
			await navBarComponent.clickMySites();
		} );

		it( 'We should only see one option - the settings option', async function () {
			const sidebarComponent = await SidebarComponent.Expect( this.driver );
			const numberMenuItems = await sidebarComponent.numberOfMenuItems();
			assert.strictEqual(
				numberMenuItems,
				1,
				'There is not a single menu item for a domain only site'
			);
			const exists = await sidebarComponent.settingsOptionExists();
			return assert( exists, 'The settings menu option does not exist' );
		} );

		after( 'We can cancel the domain and delete newly created account', async function () {
			return await ( async () => {
				await ReaderPage.Visit( this.driver );
				const navBarComponent = await NavBarComponent.Expect( this.driver );
				await navBarComponent.clickMySites();
				const sidebarComponent = await SidebarComponent.Expect( this.driver );
				await sidebarComponent.settingsOptionExists( true );
				const domainOnlySettingsPage = await DomainOnlySettingsPage.Expect( this.driver );
				await domainOnlySettingsPage.manageDomain();
				const domainDetailsPage = await DomainDetailsPage.Expect( this.driver );
				await domainDetailsPage.cancelDomain();

				const cancelPurchasePage = await CancelPurchasePage.Expect( this.driver );
				await cancelPurchasePage.clickCancelPurchase();

				const cancelDomainPage = await CancelDomainPage.Expect( this.driver );
				await cancelDomainPage.completeSurveyAndConfirm();
				return await new DeleteAccountFlow( this.driver ).deleteAccount( siteName );
			} )().catch( ( err ) => {
				SlackNotifier.warn(
					`There was an error in the hooks that clean up the test account but since it is cleaning up we really don't care: '${ err }'`,
					{ suppressDuplicateMessages: true }
				);
			} );
		} );
	} );

	describe( 'Sign up for a site on a business paid plan w/ domain name coming in via /create as business flow in CAD currency @signup', function () {
		const siteName = dataHelper.getNewBlogName();
		const expectedDomainName = `${ siteName }.live`;
		const emailAddress = dataHelper.getEmailAddress( siteName, signupInboxId );
		const testDomainRegistarDetails = dataHelper.getTestDomainRegistarDetails( emailAddress );
		const currencyValue = 'CAD';
		const expectedCurrencySymbol = 'C$';

		before( async function () {
			if ( process.env.SKIP_DOMAIN_TESTS === 'true' ) {
				await SlackNotifier.warn(
					'Domains tests are currently disabled as SKIP_DOMAIN_TESTS is set to true',
					{ suppressDuplicateMessages: true }
				);
				return this.skip();
			}
		} );

		before( async function () {
			return await driverManager.ensureNotLoggedIn( this.driver );
		} );

		it( 'We can set the sandbox cookie for payments', async function () {
			const wPHomePage = await WPHomePage.Visit( this.driver );
			await wPHomePage.checkURL( locale );
			await wPHomePage.setSandboxModeForPayments( sandboxCookieValue );
			return await wPHomePage.setCurrencyForPayments( currencyValue );
		} );

		it( 'Can visit the start page', async function () {
			await StartPage.Visit(
				this.driver,
				StartPage.getStartURL( { culture: locale, flow: 'business' } )
			);
		} );

		it( 'Can then enter account details and continue', async function () {
			const createYourAccountPage = await CreateYourAccountPage.Expect( this.driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				siteName,
				passwordForTestAccounts
			);
		} );

		it( 'Can then see the domains page, and can search for a blog name, can see and select a paid .live address in results ', async function () {
			const findADomainComponent = await FindADomainComponent.Expect( this.driver );
			await findADomainComponent.searchForBlogNameAndWaitForResults( expectedDomainName );
			try {
				return await findADomainComponent.selectDomainAddress( expectedDomainName );
			} catch ( err ) {
				if ( await NewUserRegistrationUnavailableComponent.Expect( this.driver ) ) {
					await SlackNotifier.warn( 'SKIPPING: Domain registration is currently unavailable. ' );
					return this.skip();
				}
			}
		} );

		it( 'Can then see the sign up processing page which will finish automatically move along', async function () {
			return await new SignUpStep( this.driver ).continueAlong( siteName, passwordForTestAccounts );
		} );

		it( 'Can see checkout page and enter registrar details', async function () {
			const checkOutPage = await CheckOutPage.Expect( this.driver );
			await checkOutPage.enterRegistrarDetails( testDomainRegistarDetails );
			return await checkOutPage.submitForm();
		} );

		it( 'Can then see the secure payment page with the correct products in the cart', async function () {
			const securePaymentComponent = await SecurePaymentComponent.Expect( this.driver );
			const domainInCart = await securePaymentComponent.containsDotLiveDomain();
			assert.strictEqual( domainInCart, true, "The cart doesn't contain the .live domain product" );
			const businessPlanInCart = await securePaymentComponent.containsBusinessPlan();
			assert.strictEqual(
				businessPlanInCart,
				true,
				"The cart doesn't contain the business plan product"
			);
			// Removing product number assertion due to https://github.com/Automattic/wp-calypso/issues/24579
			// const numberOfProductsInCart = await securePaymentComponent.numberOfProductsInCart();
			// return assert.strictEqual(
			// 	numberOfProductsInCart,
			// 	3,
			// 	"The cart doesn't contain the expected number of products"
			// );
		} );

		it( 'Can then see the secure payment page with the expected currency in the cart', async function () {
			const securePaymentComponent = await SecurePaymentComponent.Expect( this.driver );
			if ( driverManager.currentScreenSize() === 'desktop' ) {
				const totalShown = await securePaymentComponent.cartTotalDisplayed();
				assert.strictEqual(
					totalShown.indexOf( expectedCurrencySymbol ),
					0,
					`The cart total '${ totalShown }' does not begin with '${ expectedCurrencySymbol }'`
				);
			}
			const paymentButtonText = await securePaymentComponent.paymentButtonText();
			return assert(
				paymentButtonText.includes( expectedCurrencySymbol ),
				`The payment button text '${ paymentButtonText }' does not contain the expected currency symbol: '${ expectedCurrencySymbol }'`
			);
		} );

		it( 'Can enter/submit test payment details', async function () {
			const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
			const securePaymentComponent = await SecurePaymentComponent.Expect( this.driver );
			// No need to fill out contact details here as they already have been completed
			await securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
			await securePaymentComponent.submitPaymentDetails();
			await securePaymentComponent.waitForCreditCardPaymentProcessing();
			return await securePaymentComponent.waitForPageToDisappear();
		} );

		sharedSteps.canSeeTheOnboardingChecklist();

		it( 'Can delete the plan', async function () {
			return await new DeletePlanFlow( this.driver ).deletePlan( 'business', {
				deleteDomainAlso: true,
			} );
		} );

		after( 'Can delete our newly created account', async function () {
			return await new DeleteAccountFlow( this.driver ).deleteAccount( siteName );
		} );
	} );

	describe( 'Basic sign up for a free site @signup @email @ie11canary', function () {
		const blogName = dataHelper.getNewBlogName();

		before( async function () {
			return await driverManager.ensureNotLoggedIn( this.driver );
		} );

		it( 'Can visit the start page', async function () {
			await StartPage.Visit( this.driver, StartPage.getStartURL( { culture: locale } ) );
		} );

		it( 'Can then enter account details and continue', async function () {
			const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
			const createYourAccountPage = await CreateYourAccountPage.Expect( this.driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				blogName,
				passwordForTestAccounts
			);
		} );

		it( 'Can then see the domains page, and Can search for a blog name, can see and select a free .wordpress address in the results', async function () {
			// const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
			const findADomainComponent = await FindADomainComponent.Expect( this.driver );
			await findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
			// See https://github.com/Automattic/wp-calypso/pull/38641/
			// await findADomainComponent.checkAndRetryForFreeBlogAddresses(
			// 	expectedBlogAddresses,
			// 	blogName
			// );
			// const actualAddress = await findADomainComponent.freeBlogAddress();
			// assert(
			// 	expectedBlogAddresses.indexOf( actualAddress ) > -1,
			// 	`The displayed free blog address: '${ actualAddress }' was not the expected addresses: '${ expectedBlogAddresses }'`
			// );
			return await findADomainComponent.selectFreeAddress();
		} );

		it( 'Can then see the plans page and pick the free plan', async function () {
			const pickAPlanPage = await PickAPlanPage.Expect( this.driver );
			return await pickAPlanPage.selectFreePlan();
		} );

		it( 'Can then see the sign up processing page which will finish automatically move along', async function () {
			return await new SignUpStep( this.driver ).continueAlong( blogName, passwordForTestAccounts );
		} );

		sharedSteps.canSeeTheOnboardingChecklist();

		it( 'Can update the homepage', async function () {
			// Skipping if IE11 due to JS errors caused by missing DOMRect polyfill.
			// See https://github.com/Automattic/wp-calypso/issues/40502
			if ( dataHelper.getTargetType() === 'IE11' ) {
				return this.skip();
			}
			const myHomePage = await MyHomePage.Expect( this.driver );
			await myHomePage.updateHomepageFromSiteSetup();
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			await gEditorComponent.initEditor();

			const hasInvalidBlocks = await gEditorComponent.hasInvalidBlocks();
			assert.strictEqual(
				hasInvalidBlocks,
				false,
				'There are invalid blocks when editing the homepage'
			);
			return await gEditorComponent.closeEditor();
		} );

		after( 'Can delete our newly created account', async function () {
			return await new DeleteAccountFlow( this.driver ).deleteAccount( blogName );
		} );
	} );

	describe( 'Sign up for free subdomain site @signup', function () {
		const blogName = dataHelper.getNewBlogName();
		const expectedDomainName = `${ blogName }.art.blog`;

		before( async function () {
			if ( process.env.SKIP_DOMAIN_TESTS === 'true' ) {
				await SlackNotifier.warn(
					'Domains tests are currently disabled as SKIP_DOMAIN_TESTS is set to true',
					{ suppressDuplicateMessages: true }
				);
				return this.skip();
			}
		} );

		before( async function () {
			await driverManager.ensureNotLoggedIn( this.driver );
		} );

		it( 'Can enter the onboarding flow with vertical set', async function () {
			await StartPage.Visit(
				this.driver,
				StartPage.getStartURL( {
					culture: locale,
					flow: 'onboarding-with-preview',
					query: 'vertical=art',
				} )
			);
		} );

		it( 'Can then enter account details and continue', async function () {
			const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
			const createYourAccountPage = await CreateYourAccountPage.Expect( this.driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				blogName,
				passwordForTestAccounts
			);
		} );

		it( 'Can see the "Site Type" page, and enter some site information', async function () {
			const siteTypePage = await SiteTypePage.Expect( this.driver );
			return await siteTypePage.selectBlogType();
		} );

		it( 'Can see the "Site title" page, and enter the site title', async function () {
			const siteTitlePage = await SiteTitlePage.Expect( this.driver );
			await siteTitlePage.enterSiteTitle( blogName );
			return await siteTitlePage.submitForm();
		} );

		it( 'Can then see the domains page, and Can search for a blog name, can see and select a free .art.blog address in the results', async function () {
			const findADomainComponent = await FindADomainComponent.Expect( this.driver );
			await findADomainComponent.searchForBlogNameAndWaitForResults( expectedDomainName );
			// More details: https://github.com/Automattic/wp-calypso/pull/35347
			// await findADomainComponent.checkAndRetryForFreeBlogAddresses(
			// 	expectedDomainName,
			// 	blogName
			// );
			const actualAddress = await findADomainComponent.freeBlogAddress();
			assert(
				expectedDomainName.indexOf( actualAddress ) > -1,
				`The displayed blog address: '${ actualAddress }' was not the expected addresses: '${ expectedDomainName }'`
			);
			return await findADomainComponent.selectFreeAddress();
		} );

		it( 'Can then see the plans page and pick the free plan', async function () {
			const pickAPlanPage = await PickAPlanPage.Expect( this.driver );
			return await pickAPlanPage.selectFreePlan();
		} );

		it( 'Can then see the sign up processing page which will finish automatically move along', async function () {
			return await new SignUpStep( this.driver ).continueAlong( blogName, passwordForTestAccounts );
		} );

		sharedSteps.canSeeTheOnboardingChecklist();

		it( 'Can delete site', async function () {
			const sidebarComponent = await SidebarComponent.Expect( this.driver );
			await sidebarComponent.selectSettings();
			const settingsPage = await SettingsPage.Expect( this.driver );
			return await settingsPage.deleteSite( expectedDomainName );
		} );

		after( 'Can delete our newly created account', async function () {
			return await new DeleteAccountFlow( this.driver ).deleteAccount( blogName );
		} );
	} );

	describe( 'Sign up for an account only (no site) then add a site as an existing user @signup', function () {
		const userName = dataHelper.getNewBlogName();
		const blogName = dataHelper.getNewBlogName();

		before( async function () {
			await driverManager.ensureNotLoggedIn( this.driver );
		} );

		it( 'Can enter the account flow and see the account details page', async function () {
			await StartPage.Visit(
				this.driver,
				StartPage.getStartURL( {
					culture: locale,
					flow: 'account',
				} )
			);
			await CreateYourAccountPage.Expect( this.driver );
		} );

		it( 'Can then enter account details and continue', async function () {
			const emailAddress = dataHelper.getEmailAddress( userName, signupInboxId );
			const createYourAccountPage = await CreateYourAccountPage.Expect( this.driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				userName,
				passwordForTestAccounts
			);
		} );

		it( 'Can then see the sign up processing page which will finish automatically move along', async function () {
			return await new SignUpStep( this.driver ).continueAlong( blogName, passwordForTestAccounts );
		} );

		it( 'We are then on the Reader page and have no sites - we click Create Site', async function () {
			await ReaderPage.Expect( this.driver );
			const navBarComponent = await NavBarComponent.Expect( this.driver );
			await navBarComponent.clickMySites();
			const noSitesComponent = await NoSitesComponent.Expect( this.driver );
			return await noSitesComponent.createSite();
		} );

		it( 'We are creating the site using the New Onboarding (Gutenboarding)', async function () {
			return await new GutenboardingFlow( this.driver ).createFreeSite();
		} );

		after( 'Can delete our newly created account', async function () {
			return await new DeleteAccountFlow( this.driver ).deleteAccount( userName );
		} );
	} );

	describe( 'Sign up for a Reader account @signup', function () {
		const userName = dataHelper.getNewBlogName();

		before( async function () {
			await driverManager.ensureNotLoggedIn( this.driver );
		} );

		it( 'Can enter the reader flow and see the Reader landing page', async function () {
			await StartPage.Visit(
				this.driver,
				StartPage.getStartURL( {
					culture: locale,
					flow: 'reader',
				} )
			);
			return await ReaderLandingPage.Expect( this.driver );
		} );

		it( 'Can choose Start Using The Reader', async function () {
			const readerLandingPage = await ReaderLandingPage.Expect( this.driver );
			return await readerLandingPage.clickStartUsingTheReader();
		} );

		it( 'Can see the account details page and enter account details and continue', async function () {
			const emailAddress = dataHelper.getEmailAddress( userName, signupInboxId );
			const createYourAccountPage = await CreateYourAccountPage.Expect( this.driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				userName,
				passwordForTestAccounts
			);
		} );

		it( 'Can then see the sign up processing page which will finish automatically move along', async function () {
			return await new SignUpStep( this.driver ).continueAlong( userName, passwordForTestAccounts );
		} );

		it( 'We are then on the Reader page', async function () {
			return await ReaderPage.Expect( this.driver );
		} );

		after( 'Can delete our newly created account', async function () {
			return await new DeleteAccountFlow( this.driver ).deleteAccount( userName );
		} );
	} );

	describe( 'Signup and create new site using the New Onboarding (Gutenboarding) @signup', function () {
		const emailAddress = dataHelper.getEmailAddress( dataHelper.getNewBlogName(), signupInboxId );

		before( async function () {
			await driverManager.ensureNotLoggedIn( this.driver );
		} );

		it( 'Signup and create site using default options', async function () {
			await NewPage.Visit( this.driver );

			await new GutenboardingFlow( this.driver ).signupAndCreateFreeSite( { emailAddress } );
		} );

		after( 'Can delete our newly created account', async function () {
			// Gutenboarding creates users with auto-generated usernames so we need
			// to find the username before we can delete it.
			const accountSettingsPage = await AccountSettingsPage.Visit( this.driver );
			const username = await accountSettingsPage.getUsername();

			return await new DeleteAccountFlow( this.driver ).deleteAccount( username );
		} );
	} );

	describe( 'Sign up for a site on a paid plan w/ domain name then move back to domain step @signup', function () {
		const siteName = dataHelper.getNewBlogName();
		const expectedDomainName = `${ siteName }.live`;
		const emailAddress = dataHelper.getEmailAddress( siteName, signupInboxId );
		const testDomainRegistarDetails = dataHelper.getTestDomainRegistarDetails( emailAddress );

		before( async function () {
			await driverManager.ensureNotLoggedIn( this.driver );
		} );

		it( 'Can visit the start page', async function () {
			await StartPage.Visit( this.driver, StartPage.getStartURL() );
		} );

		it( 'Can see the account page and enter account details', async function () {
			const createYourAccountPage = await CreateYourAccountPage.Expect( this.driver );
			await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				siteName,
				passwordForTestAccounts
			);
		} );

		it( 'Can then see the domains page, and can search for a blog name, can see and select a paid .live address in results ', async function () {
			const findADomainComponent = await FindADomainComponent.Expect( this.driver );
			await findADomainComponent.searchForBlogNameAndWaitForResults( expectedDomainName );
			try {
				await findADomainComponent.selectDomainAddress( expectedDomainName );
			} catch ( err ) {
				if ( await NewUserRegistrationUnavailableComponent.Expect( this.driver ) ) {
					await SlackNotifier.warn( 'SKIPPING: Domain registration is currently unavailable. ' );
					return this.skip();
				}
			}
		} );

		it( 'Can then see the plans page and select the premium plan ', async function () {
			const pickAPlanPage = await PickAPlanPage.Expect( this.driver );
			const displayed = await pickAPlanPage.displayed();
			assert.strictEqual( displayed, true, 'The pick a plan page is not displayed' );
			await pickAPlanPage.selectPremiumPlan();
		} );

		it( 'Can then see the sign up processing page which will finish automatically move along', async function () {
			return await new SignUpStep( this.driver ).continueAlong( siteName, passwordForTestAccounts );
		} );

		it( 'Can see checkout page and enter registrar details', async function () {
			const checkOutPage = await CheckOutPage.Expect( this.driver );
			await checkOutPage.enterRegistrarDetails( testDomainRegistarDetails );
		} );

		it( 'Can see the domain suggestions when moves back from the checkout page', async function () {
			await this.driver.navigate().back();
			const findADomainComponent = await FindADomainComponent.Expect( this.driver );
			await findADomainComponent.selectFreeAddress();
		} );

		after( 'Can delete our newly created account', async function () {
			await new DeleteAccountFlow( this.driver ).deleteAccount( siteName );
		} );
	} );
} );
