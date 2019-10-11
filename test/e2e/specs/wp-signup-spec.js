/** @format */

/**
 * External dependencies
 */
import config from 'config';
import assert from 'assert';
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverManager from '../lib/driver-manager.js';
import * as driverHelper from '../lib/driver-helper.js';
import * as dataHelper from '../lib/data-helper.js';

import WPHomePage from '../lib/pages/wp-home-page.js';
import StartPage from '../lib/pages/signup/start-page.js';
import JetpackAddNewSitePage from '../lib/pages/signup/jetpack-add-new-site-page';

import AboutPage from '../lib/pages/signup/about-page.js';
import DomainFirstPage from '../lib/pages/signup/domain-first-page';
import PickAPlanPage from '../lib/pages/signup/pick-a-plan-page.js';
import CreateYourAccountPage from '../lib/pages/signup/create-your-account-page.js';
import CheckOutPage from '../lib/pages/signup/checkout-page';
import CheckOutThankyouPage from '../lib/pages/signup/checkout-thankyou-page.js';
import SiteTypePage from '../lib/pages/signup/site-type-page';
import SiteTopicPage from '../lib/pages/signup/site-topic-page';
import SiteTitlePage from '../lib/pages/signup/site-title-page';
import LoginPage from '../lib/pages/login-page';
import MagicLoginPage from '../lib/pages/magic-login-page';
import ReaderPage from '../lib/pages/reader-page';
import DomainOnlySettingsPage from '../lib/pages/domain-only-settings-page';
import DomainDetailsPage from '../lib/pages/domain-details-page';
import ManagePurchasePage from '../lib/pages/manage-purchase-page';
import CancelPurchasePage from '../lib/pages/cancel-purchase-page';
import CancelDomainPage from '../lib/pages/cancel-domain-page';

import FindADomainComponent from '../lib/components/find-a-domain-component.js';
import SecurePaymentComponent from '../lib/components/secure-payment-component.js';
import NavBarComponent from '../lib/components/nav-bar-component';
import SideBarComponent from '../lib/components/sidebar-component';

import * as SlackNotifier from '../lib/slack-notifier';

import EmailClient from '../lib/email-client.js';
import DeleteAccountFlow from '../lib/flows/delete-account-flow';
import DeletePlanFlow from '../lib/flows/delete-plan-flow';
import SignUpStep from '../lib/flows/sign-up-step';

import * as sharedSteps from '../lib/shared-steps/wp-signup-spec';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const signupInboxId = config.get( 'signupInboxId' );
const host = dataHelper.getJetpackHost();
const locale = driverManager.currentLocale();
const passwordForTestAccounts = config.get( 'passwordForNewTestSignUps' );
const sandboxCookieValue = config.get( 'storeSandboxCookieValue' );

let driver;

before( async function() {
	this.timeout( startBrowserTimeoutMS );
	this.driver = driver = await driverManager.startBrowser();
} );

// This file has been split. There are more sign up tests in wp-signup2-spec.js
describe( `[${ host }] Sign Up  (${ screenSize }, ${ locale })`, function() {
	this.timeout( mochaTimeOut );

	describe( 'Sign up for a free WordPress.com site from the Jetpack new site page, and log in via a magic link @parallel @email', function() {
		const blogName = dataHelper.getNewBlogName();
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
		let magicLoginLink;

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step(
			'Can visit the Jetpack Add New Site page and choose "Create a shiny new WordPress.com site"',
			async function() {
				const jetpackAddNewSitePage = await JetpackAddNewSitePage.Visit( driver );
				await jetpackAddNewSitePage.createNewWordPressDotComSite();
			}
		);

		step( 'Can see the account page and enter account details', async function() {
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				blogName,
				passwordForTestAccounts
			);
		} );

		step( 'Can see the "Site Type" page, and enter some site information', async function() {
			const siteTypePage = await SiteTypePage.Expect( driver );
			return await siteTypePage.selectBusinessType();
		} );

		step( 'Can see the "Site Topic" page, and enter the site topic', async function() {
			const siteTopicPage = await SiteTopicPage.Expect( driver );
			await siteTopicPage.enterSiteTopic( 'Tech Blog' );
			return await siteTopicPage.submitForm();
		} );

		step( 'Can see the "Site title" page, and enter the site title', async function() {
			const siteTitlePage = await SiteTitlePage.Expect( driver );
			await siteTitlePage.enterSiteTitle( blogName );
			return await siteTitlePage.submitForm();
		} );

		step(
			'Can then see the domains page, and Can search for a blog name, can see and select a free .wordpress address in the results',
			async function() {
				const findADomainComponent = await FindADomainComponent.Expect( driver );
				await findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
				await findADomainComponent.checkAndRetryForFreeBlogAddresses(
					expectedBlogAddresses,
					blogName
				);
				const actualAddress = await findADomainComponent.freeBlogAddress();
				assert(
					expectedBlogAddresses.indexOf( actualAddress ) > -1,
					`The displayed free blog address: '${ actualAddress }' was not the expected addresses: '${ expectedBlogAddresses }'`
				);
				return await findADomainComponent.selectFreeAddress();
			}
		);

		step( 'Can see the plans page and pick the free plan', async function() {
			const pickAPlanPage = await PickAPlanPage.Expect( driver );
			return await pickAPlanPage.selectFreePlan();
		} );

		step(
			'Can then see the sign up processing page which will finish automatically move along',
			async function() {
				return await new SignUpStep( driver ).continueAlong( blogName, passwordForTestAccounts );
			}
		);

		sharedSteps.canSeeTheOnboardingChecklist();

		step( 'Can log out and request a magic link', async function() {
			if ( process.env.HORIZON_TESTS === 'true' ) {
				return this.skip();
			}
			await driverManager.ensureNotLoggedIn( driver );
			const loginPage = await LoginPage.Visit( driver );
			return await loginPage.requestMagicLink( emailAddress );
		} );

		step( 'Can see email containing magic link', async function() {
			if ( process.env.HORIZON_TESTS === 'true' ) {
				return this.skip();
			}
			const emailClient = new EmailClient( signupInboxId );
			const validator = emails => emails.find( email => email.subject.includes( 'WordPress.com' ) );
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

		step( 'Can visit the magic link and we should be logged in', async function() {
			if ( process.env.HORIZON_TESTS === 'true' ) {
				return this.skip();
			}
			await driver.get( magicLoginLink );
			const magicLoginPage = await MagicLoginPage.Expect( driver );
			await magicLoginPage.finishLogin();
			return await ReaderPage.Expect( driver );
		} );

		after( 'Can delete our newly created account', async function() {
			return await new DeleteAccountFlow( driver ).deleteAccount( blogName );
		} );
	} );

	describe( 'Sign up for a free site, see the site preview, activate email and can publish @parallel', function() {
		const blogName = dataHelper.getNewBlogName();
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can visit the start page', async function() {
			await StartPage.Visit( driver, StartPage.getStartURL( { culture: locale } ) );
		} );

		step( 'Can see the account page and enter account details', async function() {
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				blogName,
				passwordForTestAccounts
			);
		} );

		step( 'Can see the "Site Type" page, and enter some site information', async function() {
			const siteTypePage = await SiteTypePage.Expect( driver );
			return await siteTypePage.selectBusinessType();
		} );

		step( 'Can see the "Site Topic" page, and enter the site topic', async function() {
			const siteTopicPage = await SiteTopicPage.Expect( driver );
			await siteTopicPage.enterSiteTopic( 'Tech Blog' );
			return await siteTopicPage.submitForm();
		} );

		step( 'Can see the "Site title" page, and enter the site title', async function() {
			const siteTitlePage = await SiteTitlePage.Expect( driver );
			await siteTitlePage.enterSiteTitle( blogName );
			return await siteTitlePage.submitForm();
		} );

		step(
			'Can then see the domains page, and Can search for a blog name, can see and select a free .wordpress address in the results',
			async function() {
				const findADomainComponent = await FindADomainComponent.Expect( driver );
				await findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
				await findADomainComponent.checkAndRetryForFreeBlogAddresses(
					expectedBlogAddresses,
					blogName
				);
				const actualAddress = await findADomainComponent.freeBlogAddress();
				assert(
					expectedBlogAddresses.indexOf( actualAddress ) > -1,
					`The displayed free blog address: '${ actualAddress }' was not the expected addresses: '${ expectedBlogAddresses }'`
				);
				return await findADomainComponent.selectFreeAddress();
			}
		);

		step( 'Can see the plans page and pick the free plan', async function() {
			const pickAPlanPage = await PickAPlanPage.Expect( driver );
			return await pickAPlanPage.selectFreePlan();
		} );

		step(
			'Can then see the sign up processing page which will finish automatically move along',
			async function() {
				return await new SignUpStep( driver ).continueAlong( blogName, passwordForTestAccounts );
			}
		);

		sharedSteps.canSeeTheOnboardingChecklist();

		after( 'Can delete our newly created account', async function() {
			return await new DeleteAccountFlow( driver ).deleteAccount( blogName );
		} );
	} );

	describe( 'Sign up for a non-blog site on a premium paid plan through main flow using a coupon @parallel @visdiff', function() {
		const blogName = dataHelper.getNewBlogName();
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
		let originalCartAmount;

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can visit the start page', async function() {
			await StartPage.Visit( driver, StartPage.getStartURL( { flow: 'main', culture: locale } ) );
		} );

		step( 'Can see the account page and enter account details', async function() {
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				blogName,
				passwordForTestAccounts
			);
		} );

		step( 'Can see the "About" page, and enter some site information', async function() {
			const aboutPage = await AboutPage.Expect( driver );
			return await aboutPage.enterSiteDetails( blogName, '', {
				showcase: true,
			} );
		} );

		step( 'Can accept defaults for about page', async function() {
			const aboutPage = await AboutPage.Expect( driver );
			await aboutPage.submitForm();
		} );

		step( 'Can then see the domains page ', async function() {
			const findADomainComponent = await FindADomainComponent.Expect( driver );
			const displayed = await findADomainComponent.displayed();
			return assert.strictEqual( displayed, true, 'The choose a domain page is not displayed' );
		} );

		step(
			'Can search for a blog name, can see and select a free WordPress.com blog address in results',
			async function() {
				return await new SignUpStep( driver ).selectFreeWordPressDotComAddresss(
					blogName,
					expectedBlogAddresses
				);
			}
		);

		step( 'Can then see the plans page and select the premium plan ', async function() {
			const pickAPlanPage = await PickAPlanPage.Expect( driver );
			const displayed = await pickAPlanPage.displayed();
			assert.strictEqual( displayed, true, 'The pick a plan page is not displayed' );
			return await pickAPlanPage.selectPremiumPlan();
		} );

		step(
			'Can then see the sign up processing page which will automatically move along',
			async function() {
				return await new SignUpStep( driver ).continueAlong( blogName, passwordForTestAccounts );
			}
		);

		step(
			'Can then see the secure payment page with the premium plan in the cart',
			async function() {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
				const premiumPlanInCart = await securePaymentComponent.containsPremiumPlan();
				assert.strictEqual( premiumPlanInCart, true, "The cart doesn't contain the premium plan" );
				const numberOfProductsInCart = await securePaymentComponent.numberOfProductsInCart();
				return assert.strictEqual(
					numberOfProductsInCart,
					1,
					"The cart doesn't contain the expected number of products"
				);
			}
		);

		step( 'Can Correctly Apply Coupon discount', async function() {
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
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

		step( 'Can Remove Coupon', async function() {
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );

			await securePaymentComponent.removeCoupon();

			const removedCouponAmount = await securePaymentComponent.cartTotalAmount();
			assert.strictEqual( removedCouponAmount, originalCartAmount, 'Coupon not removed properly' );
		} );

		after( 'Can delete our newly created account', async function() {
			return await new DeleteAccountFlow( driver ).deleteAccount( blogName );
		} );
	} );

	describe( 'Sign up for a site on a premium paid plan through main flow in USD currency @parallel @canary', function() {
		const blogName = dataHelper.getNewBlogName();
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
		const currencyValue = 'USD';
		const expectedCurrencySymbol = '$';

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'We can set the sandbox cookie for payments', async function() {
			const wPHomePage = await WPHomePage.Visit( driver );
			await wPHomePage.checkURL( locale );
			await wPHomePage.setSandboxModeForPayments( sandboxCookieValue );
			return await wPHomePage.setCurrencyForPayments( currencyValue );
		} );

		step( 'Can visit the start page', async function() {
			await StartPage.Visit( driver, StartPage.getStartURL( { culture: locale } ) );
		} );

		step( 'Can then enter account details', async function() {
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				blogName,
				passwordForTestAccounts
			);
		} );

		step( 'Can see the "Site Type" page, and enter some site information', async function() {
			const siteTypePage = await SiteTypePage.Expect( driver );
			return await siteTypePage.selectBusinessType();
		} );

		step( 'Can see the "Site Topic" page, and enter the site topic', async function() {
			const siteTopicPage = await SiteTopicPage.Expect( driver );
			await siteTopicPage.enterSiteTopic( 'Tech Blog' );
			return await siteTopicPage.submitForm();
		} );

		step( 'Can see the "Site title" page, and enter the site title', async function() {
			const siteTitlePage = await SiteTitlePage.Expect( driver );
			await siteTitlePage.enterSiteTitle( blogName );
			return await siteTitlePage.submitForm();
		} );

		step( 'Can then see the domains page ', async function() {
			const findADomainComponent = await FindADomainComponent.Expect( driver );
			const displayed = await findADomainComponent.displayed();
			return assert.strictEqual( displayed, true, 'The choose a domain page is not displayed' );
		} );

		step(
			'Can search for a blog name, can see and select a free WordPress.com blog address in results',
			async function() {
				return await new SignUpStep( driver ).selectFreeWordPressDotComAddresss(
					blogName,
					expectedBlogAddresses
				);
			}
		);

		step( 'Can then see the plans page and select the premium plan ', async function() {
			const pickAPlanPage = await PickAPlanPage.Expect( driver );
			const displayed = await pickAPlanPage.displayed();
			assert.strictEqual( displayed, true, 'The pick a plan page is not displayed' );
			return await pickAPlanPage.selectPremiumPlan();
		} );

		step(
			'Can then see the sign up processing page which will automatically move along',
			async function() {
				return await new SignUpStep( driver ).continueAlong( blogName, passwordForTestAccounts );
			}
		);

		step(
			'Can then see the secure payment page with the premium plan in the cart',
			async function() {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
				const premiumPlanInCart = await securePaymentComponent.containsPremiumPlan();
				assert.strictEqual( premiumPlanInCart, true, "The cart doesn't contain the premium plan" );
				const numberOfProductsInCart = await securePaymentComponent.numberOfProductsInCart();
				return assert.strictEqual(
					numberOfProductsInCart,
					1,
					"The cart doesn't contain the expected number of products"
				);
			}
		);

		step(
			'Can then see the secure payment page with the expected currency in the cart',
			async function() {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
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
			}
		);

		step( 'Can enter and submit test payment details', async function() {
			const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
			await securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
			await securePaymentComponent.submitPaymentDetails();
			return await securePaymentComponent.waitForPageToDisappear();
		} );

		sharedSteps.canSeeTheOnboardingChecklist();

		step( 'Can delete the plan', async function() {
			return await new DeletePlanFlow( driver ).deletePlan( 'premium' );
		} );

		after( 'Can delete our newly created account', async function() {
			return await new DeleteAccountFlow( driver ).deleteAccount( blogName );
		} );
	} );

	describe( 'Sign up for a site on a premium paid plan coming in via /create as premium flow in JPY currency @parallel', function() {
		const blogName = dataHelper.getNewBlogName();
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );

		const currencyValue = 'JPY';
		const expectedCurrencySymbol = '¥';

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'We can set the sandbox cookie for payments', async function() {
			const wPHomePage = await WPHomePage.Visit( driver );
			await wPHomePage.checkURL( locale );
			await wPHomePage.setSandboxModeForPayments( sandboxCookieValue );
			return await wPHomePage.setCurrencyForPayments( currencyValue );
		} );

		step( 'Can visit the start page', async function() {
			await StartPage.Visit(
				driver,
				StartPage.getStartURL( { culture: locale, flow: 'premium' } )
			);
		} );

		step( 'Can see the account details page and enter account details', async function() {
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				blogName,
				passwordForTestAccounts
			);
		} );

		step( 'Can see the "Site Type" page, and enter some site information', async function() {
			const siteTypePage = await SiteTypePage.Expect( driver );
			return await siteTypePage.selectBlogType();
		} );

		step( 'Can see the "Site Topic" page, and enter the site topic', async function() {
			const siteTopicPage = await SiteTopicPage.Expect( driver );
			await siteTopicPage.enterSiteTopic( 'Tech Blog' );
			return await siteTopicPage.submitForm();
		} );

		step( 'Can see the "Site title" page, and enter the site title', async function() {
			const siteTitlePage = await SiteTitlePage.Expect( driver );
			await siteTitlePage.enterSiteTitle( blogName );
			return await siteTitlePage.submitForm();
		} );

		step(
			'Can then see the domains page and can search for a blog name, can see and select a free WordPress.com blog address in results',
			async function() {
				return await new SignUpStep( driver ).selectFreeWordPressDotComAddresss(
					blogName,
					expectedBlogAddresses
				);
			}
		);

		step(
			'Can then see the sign up processing page which will finish automatically move along',
			async function() {
				return await new SignUpStep( driver ).continueAlong( blogName, passwordForTestAccounts );
			}
		);

		step(
			'Can then see the secure payment page with the expected currency in the cart',
			async function() {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
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
			}
		);

		step(
			'Can then see the secure payment page with the expected products in the cart',
			async function() {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
				const premiumPlanInCart = await securePaymentComponent.containsPremiumPlan();
				assert.strictEqual( premiumPlanInCart, true, "The cart doesn't contain the premium plan" );
				const numberOfProductsInCart = await securePaymentComponent.numberOfProductsInCart();
				return assert.strictEqual(
					numberOfProductsInCart,
					1,
					"The cart doesn't contain the expected number of products"
				);
			}
		);

		step( 'Can submit test payment details', async function() {
			const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
			await securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
			await securePaymentComponent.submitPaymentDetails();
			return await securePaymentComponent.waitForPageToDisappear();
		} );

		sharedSteps.canSeeTheOnboardingChecklist();

		step( 'Can delete the plan', async function() {
			return await new DeletePlanFlow( driver ).deletePlan( 'premium' );
		} );

		after( 'Can delete our newly created account', async function() {
			return await new DeleteAccountFlow( driver ).deleteAccount( blogName );
		} );
	} );

	describe( 'Sign up for a site on a personal paid plan coming in via /create as personal flow in GBP currency @parallel', function() {
		const blogName = dataHelper.getNewBlogName();
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
		const currencyValue = 'GBP';
		const expectedCurrencySymbol = '£';

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'We can set the sandbox cookie for payments', async function() {
			const wPHomePage = await WPHomePage.Visit( driver );
			await wPHomePage.checkURL( locale );
			await wPHomePage.setSandboxModeForPayments( sandboxCookieValue );
			return await wPHomePage.setCurrencyForPayments( currencyValue );
		} );

		step( 'Can visit the start page', async function() {
			await StartPage.Visit(
				driver,
				StartPage.getStartURL( { culture: locale, flow: 'personal' } )
			);
		} );

		step( 'Can see the account details page and enter account details', async function() {
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				blogName,
				passwordForTestAccounts
			);
		} );

		step( 'Can see the "Site Type" page, and enter some site information', async function() {
			const siteTypePage = await SiteTypePage.Expect( driver );
			return await siteTypePage.selectBlogType();
		} );

		step( 'Can see the "Site Topic" page, and enter the site topic', async function() {
			const siteTopicPage = await SiteTopicPage.Expect( driver );
			await siteTopicPage.enterSiteTopic( 'Tech Blog' );
			return await siteTopicPage.submitForm();
		} );

		step( 'Can see the "Site title" page, and enter the site title', async function() {
			const siteTitlePage = await SiteTitlePage.Expect( driver );
			await siteTitlePage.enterSiteTitle( blogName );
			return await siteTitlePage.submitForm();
		} );

		step(
			'Can then see the domains page and can search for a blog name, can see and select a free WordPress.com blog address in results',
			async function() {
				return await new SignUpStep( driver ).selectFreeWordPressDotComAddresss(
					blogName,
					expectedBlogAddresses
				);
			}
		);

		step(
			'Can then see the sign up processing page which will finish automatically move along',
			async function() {
				return await new SignUpStep( driver ).continueAlong( blogName, passwordForTestAccounts );
			}
		);

		step(
			'Can then see the secure payment page with the expected currency in the cart',
			async function() {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
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
			}
		);

		step(
			'Can then see the secure payment page with the expected products in the cart',
			async function() {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
				const personalPlanInCart = await securePaymentComponent.containsPersonalPlan();
				assert.strictEqual(
					personalPlanInCart,
					true,
					"The cart doesn't contain the personal plan"
				);
				const numberOfProductsInCart = await securePaymentComponent.numberOfProductsInCart();
				return assert.strictEqual(
					numberOfProductsInCart,
					1,
					"The cart doesn't contain the expected number of products"
				);
			}
		);

		step( 'Can submit test payment details', async function() {
			const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
			await securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
			await securePaymentComponent.submitPaymentDetails();
			return await securePaymentComponent.waitForPageToDisappear();
		} );

		sharedSteps.canSeeTheOnboardingChecklist();

		step( 'Can delete the plan', async function() {
			return await new DeletePlanFlow( driver ).deletePlan( 'personal' );
		} );

		after( 'Can delete our newly created account', async function() {
			return await new DeleteAccountFlow( driver ).deleteAccount( blogName );
		} );
	} );

	describe.skip( 'Sign up for a domain only purchase coming in from wordpress.com/domains in EUR currency @parallel', function() {
		const siteName = dataHelper.getNewBlogName();
		const expectedDomainName = `${ siteName }.live`;
		const emailAddress = dataHelper.getEmailAddress( siteName, signupInboxId );
		const testDomainRegistarDetails = dataHelper.getTestDomainRegistarDetails( emailAddress );
		const currencyValue = 'EUR';
		const expectedCurrencySymbol = '€';

		before( async function() {
			if ( process.env.SKIP_DOMAIN_TESTS === 'true' ) {
				await SlackNotifier.warn(
					'Domains tests are currently disabled as SKIP_DOMAIN_TESTS is set to true',
					{ suppressDuplicateMessages: true }
				);
				return this.skip();
			}
		} );

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'We can visit set the sandbox cookie for payments', async function() {
			const wPHomePage = await WPHomePage.Visit( driver );
			await wPHomePage.checkURL( locale );
			await wPHomePage.setSandboxModeForPayments( sandboxCookieValue );
			return await wPHomePage.setCurrencyForPayments( currencyValue );
		} );

		step( 'Can visit the domains start page', async function() {
			await StartPage.Visit(
				driver,
				StartPage.getStartURL( {
					culture: locale,
					flow: 'domain-first',
					query: `new=${ expectedDomainName }`,
				} )
			);
		} );

		step( 'Can select domain only from the domain first choice page', async function() {
			const domainFirstPage = await DomainFirstPage.Expect( driver );
			return await domainFirstPage.chooseJustBuyTheDomain();
		} );

		step( 'Can then enter account details', async function() {
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				siteName,
				passwordForTestAccounts
			);
		} );

		step(
			'Can then see the sign up processing page which will finish automatically move along',
			async function() {
				return await new SignUpStep( driver ).continueAlong( siteName, passwordForTestAccounts );
			}
		);

		step(
			'Can see checkout page, choose domain privacy option and enter registrar details',
			async function() {
				let checkOutPage;
				try {
					checkOutPage = await CheckOutPage.Expect( driver );
				} catch ( err ) {
					//TODO: Check this code once more when domain registration is not available
					if (
						driverHelper.isEventuallyPresentAndDisplayed( driver, By.css( '.empty-content' ) )
					) {
						await SlackNotifier.warn(
							"OOPS! Something went wrong, you don't have a site! Check if domains registrations is available."
						);
						return this.skip();
					}
				}
				await checkOutPage.selectAddPrivacyProtectionCheckbox();
				await checkOutPage.enterRegistarDetails( testDomainRegistarDetails );
				return await checkOutPage.submitForm();
			}
		);

		step(
			'Can then see the secure payment page with the correct products in the cart',
			async function() {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
				const domainInCart = await securePaymentComponent.containsDotLiveDomain();
				assert.strictEqual(
					domainInCart,
					true,
					"The cart doesn't contain the .live domain product"
				);
				const numberOfProductsInCart = await securePaymentComponent.numberOfProductsInCart();
				return assert.strictEqual(
					numberOfProductsInCart,
					1,
					"The cart doesn't contain the expected number of products"
				);
			}
		);

		step(
			'Can then see the secure payment page with the expected currency in the cart',
			async function() {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
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
			}
		);

		step( 'Can enter/submit test payment details', async function() {
			const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
			await securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
			await securePaymentComponent.submitPaymentDetails();
			await securePaymentComponent.waitForCreditCardPaymentProcessing();
			return await securePaymentComponent.waitForPageToDisappear();
		} );

		step(
			'Can see the secure check out thank you page and click "go to my domain" button to see the domain only settings page',
			async function() {
				const checkOutThankyouPage = await CheckOutThankyouPage.Expect( driver );
				await checkOutThankyouPage.goToMyDomain();
				const domainOnlySettingsPage = await DomainOnlySettingsPage.Expect( driver );
				await domainOnlySettingsPage.manageDomain();
				return await DomainDetailsPage.Expect( driver );
			}
		);

		step( 'Can open the sidebar', async function() {
			const navBarComponent = await NavBarComponent.Expect( driver );
			await navBarComponent.clickMySites();
		} );

		step( 'We should only one option - the settings option', async function() {
			const sideBarComponent = await SideBarComponent.Expect( driver );
			const numberMenuItems = await sideBarComponent.numberOfMenuItems();
			assert.strictEqual(
				numberMenuItems,
				1,
				'There is not a single menu item for a domain only site'
			);
			const exists = await sideBarComponent.settingsOptionExists();
			return assert( exists, 'The settings menu option does not exist' );
		} );

		after( 'We can cancel the domain and delete newly created account', async function() {
			return await ( async () => {
				await ReaderPage.Visit( driver );
				const navBarComponent = await NavBarComponent.Expect( driver );
				await navBarComponent.clickMySites();
				const sidebarComponent = await SideBarComponent.Expect( driver );
				await sidebarComponent.selectSettings();
				const domainOnlySettingsPage = await DomainOnlySettingsPage.Expect( driver );
				await domainOnlySettingsPage.manageDomain();
				const domainDetailsPage = await DomainDetailsPage.Expect( driver );
				await domainDetailsPage.viewPaymentSettings();

				const managePurchasePage = await ManagePurchasePage.Expect( driver );
				const domainDisplayed = await managePurchasePage.domainDisplayed();
				assert.strictEqual(
					domainDisplayed,
					expectedDomainName,
					'The domain displayed on the manage purchase page is unexpected'
				);
				await managePurchasePage.chooseCancelAndRefund();

				const cancelPurchasePage = await CancelPurchasePage.Expect( driver );
				await cancelPurchasePage.clickCancelPurchase();

				const cancelDomainPage = await CancelDomainPage.Expect( driver );
				await cancelDomainPage.completeSurveyAndConfirm();
				return await new DeleteAccountFlow( driver ).deleteAccount( siteName );
			} )().catch( err => {
				SlackNotifier.warn(
					`There was an error in the hooks that clean up the test account but since it is cleaning up we really don't care: '${ err }'`,
					{ suppressDuplicateMessages: true }
				);
			} );
		} );
	} );
} );
