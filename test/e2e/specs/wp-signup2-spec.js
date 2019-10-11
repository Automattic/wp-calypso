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

import ReaderLandingPage from '../lib/pages/signup/reader-landing-page';
import PickAPlanPage from '../lib/pages/signup/pick-a-plan-page.js';
import CreateYourAccountPage from '../lib/pages/signup/create-your-account-page.js';
import CheckOutPage from '../lib/pages/signup/checkout-page';
import ImportFromURLPage from '../lib/pages/signup/import-from-url-page';
import SiteTypePage from '../lib/pages/signup/site-type-page';
import SiteTopicPage from '../lib/pages/signup/site-topic-page';
import SiteTitlePage from '../lib/pages/signup/site-title-page';
import ReaderPage from '../lib/pages/reader-page';
import GSuiteUpsellPage from '../lib/pages/gsuite-upsell-page';
import ThemesPage from '../lib/pages/themes-page';
import ThemeDetailPage from '../lib/pages/theme-detail-page';
import ImportPage from '../lib/pages/import-page';
import SettingsPage from '../lib/pages/settings-page';

import FindADomainComponent from '../lib/components/find-a-domain-component.js';
import SecurePaymentComponent from '../lib/components/secure-payment-component.js';
import NavBarComponent from '../lib/components/nav-bar-component';
import SideBarComponent from '../lib/components/sidebar-component';
import NoSitesComponent from '../lib/components/no-sites-component';
import StepWrapperComponent from '../lib/components/step-wrapper-component';

import * as SlackNotifier from '../lib/slack-notifier';

import EmailClient from '../lib/email-client.js';
import NewUserRegistrationUnavailableComponent from '../lib/components/new-user-domain-registration-unavailable-component';
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

// This file has been split. There are more sign up tests in wp-signup-spec.js
describe( `[${ host }] Sign Up  (${ screenSize }, ${ locale })`, function() {
	this.timeout( mochaTimeOut );

	describe( 'Sign up for a site on a business paid plan w/ domain name coming in via /create as business flow in CAD currency @parallel', function() {
		const siteName = dataHelper.getNewBlogName();
		const expectedDomainName = `${ siteName }.live`;
		const emailAddress = dataHelper.getEmailAddress( siteName, signupInboxId );
		const testDomainRegistarDetails = dataHelper.getTestDomainRegistarDetails( emailAddress );
		const currencyValue = 'CAD';
		const expectedCurrencySymbol = 'C$';

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

		step( 'We can set the sandbox cookie for payments', async function() {
			const wPHomePage = await WPHomePage.Visit( driver );
			await wPHomePage.checkURL( locale );
			await wPHomePage.setSandboxModeForPayments( sandboxCookieValue );
			return await wPHomePage.setCurrencyForPayments( currencyValue );
		} );

		step( 'Can visit the start page', async function() {
			await StartPage.Visit(
				driver,
				StartPage.getStartURL( { culture: locale, flow: 'business' } )
			);
		} );

		step( 'Can then enter account details and continue', async function() {
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				siteName,
				passwordForTestAccounts
			);
		} );

		step(
			'Can see the "Site Type" page, and select online store, and switch flows',
			async function() {
				const siteTypePage = await SiteTypePage.Expect( driver );
				return await siteTypePage.selectOnlineStoreType();
			}
		);

		step(
			'Can see the domains page, and click the back navigation link, returning to original flow',
			async function() {
				await FindADomainComponent.Expect( driver );
				const stepWrapperComponent = await StepWrapperComponent.Expect( driver );
				await stepWrapperComponent.goBack();
			}
		);

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
			await siteTitlePage.enterSiteTitle( siteName );
			return await siteTitlePage.submitForm();
		} );

		step(
			'Can then see the domains page, and can search for a blog name, can see and select a paid .live address in results ',
			async function() {
				const findADomainComponent = await FindADomainComponent.Expect( driver );
				await findADomainComponent.searchForBlogNameAndWaitForResults( expectedDomainName );
				try {
					return await findADomainComponent.selectDomainAddress( expectedDomainName );
				} catch ( err ) {
					if ( await NewUserRegistrationUnavailableComponent.Expect( driver ) ) {
						await SlackNotifier.warn( 'SKIPPING: Domain registration is currently unavailable. ' );
						return this.skip();
					}
				}
			}
		);

		step(
			'Can then see the sign up processing page which will finish automatically move along',
			async function() {
				return await new SignUpStep( driver ).continueAlong( siteName, passwordForTestAccounts );
			}
		);

		step(
			'Can see checkout page, choose domain privacy option and enter registrar details',
			async function() {
				const checkOutPage = await CheckOutPage.Expect( driver );
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

		step( 'Can see the gsuite upsell page', async function() {
			const gSuiteUpsellPage = await GSuiteUpsellPage.Expect( driver );
			return await gSuiteUpsellPage.declineEmail();
		} );

		sharedSteps.canSeeTheOnboardingChecklist();

		step( 'Can delete the plan', async function() {
			return await new DeletePlanFlow( driver ).deletePlan( 'business', {
				deleteDomainAlso: true,
			} );
		} );

		after( 'Can delete our newly created account', async function() {
			return await new DeleteAccountFlow( driver ).deleteAccount( siteName );
		} );
	} );

	describe( 'Basic sign up for a free site @parallel @email @ie11canary', function() {
		const blogName = dataHelper.getNewBlogName();

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can visit the start page', async function() {
			await StartPage.Visit( driver, StartPage.getStartURL( { culture: locale } ) );
		} );

		step( 'Can then enter account details and continue', async function() {
			const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
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
			'Can then see the domains page, and Can search for a blog name, can see and select a free .wordpress address in the results',
			async function() {
				const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
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

		step( 'Can then see the plans page and pick the free plan', async function() {
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

	describe( 'Sign up while purchasing premium theme in AUD currency @parallel @email', function() {
		const blogName = dataHelper.getNewBlogName();
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
		const currencyValue = 'AUD';
		const expectedCurrencySymbol = 'A$';
		let chosenThemeName = '';

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'We can set the sandbox cookie for payments', async function() {
			const wPHomePage = await WPHomePage.Visit( driver );
			await wPHomePage.checkURL( locale );
			await wPHomePage.setSandboxModeForPayments( sandboxCookieValue );
			return await wPHomePage.setCurrencyForPayments( currencyValue );
		} );

		step( 'Can see the themes page and select premium theme ', async function() {
			// open Premium page directly. More info https://github.com/Automattic/wp-calypso/pull/36528
			const themesPage = await ThemesPage.Visit( driver, ThemesPage.getStartURL() + '/premium' );
			await themesPage.waitUntilThemesLoaded();
			await themesPage.setABTestControlGroupsInLocalStorage();
			chosenThemeName = await themesPage.getFirstThemeName();
			return await themesPage.selectNewTheme();
		} );

		step( 'Can pick theme design', async function() {
			const themeDetailPage = await ThemeDetailPage.Expect( driver );
			return await themeDetailPage.pickThisDesign();
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

		step( 'Can then see the plans page and pick the free plan', async function() {
			const pickAPlanPage = await PickAPlanPage.Expect( driver );
			return await pickAPlanPage.selectFreePlan();
		} );

		step( 'Can then enter account details and continue', async function() {
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				blogName,
				passwordForTestAccounts
			);
		} );

		step(
			'Can then see the sign up processing page which will finish automatically move along',
			async function() {
				if ( process.env.HORIZON_TESTS === 'true' ) {
					return this.skip();
				}
				return await new SignUpStep( driver ).continueAlong( blogName, passwordForTestAccounts );
			}
		);

		step(
			'Can then see the secure payment page with the chosen theme in the cart',
			async function() {
				if ( process.env.HORIZON_TESTS === 'true' ) {
					return this.skip();
				}
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
				const products = await securePaymentComponent.getProductsNames();
				assert(
					products[ 0 ].search( chosenThemeName ),
					`First product in cart is not ${ chosenThemeName }`
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

		step( 'Can submit test payment details', async function() {
			const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
			await securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
			await securePaymentComponent.submitPaymentDetails();
			return await securePaymentComponent.waitForPageToDisappear();
		} );

		sharedSteps.canSeeTheOnboardingChecklist();

		step( 'Can delete the plan', async function() {
			return await new DeletePlanFlow( driver ).deletePlan( 'theme' );
		} );

		after( 'Can delete our newly created account', async function() {
			return await new DeleteAccountFlow( driver ).deleteAccount( blogName );
		} );
	} );

	describe( 'Sign up for free subdomain site @parallel', function() {
		const blogName = dataHelper.getNewBlogName();
		const expectedDomainName = `${ blogName }.art.blog`;

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
			await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can enter the onboarding flow with vertical set', async function() {
			await StartPage.Visit(
				driver,
				StartPage.getStartURL( {
					culture: locale,
					query: 'vertical=art',
				} )
			);
		} );

		step( 'Can then enter account details and continue', async function() {
			const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
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

		step( 'Can see the "Site title" page, and enter the site title', async function() {
			const siteTitlePage = await SiteTitlePage.Expect( driver );
			await siteTitlePage.enterSiteTitle( blogName );
			return await siteTitlePage.submitForm();
		} );

		step(
			'Can then see the domains page, and Can search for a blog name, can see and select a free .art.blog address in the results',
			async function() {
				const findADomainComponent = await FindADomainComponent.Expect( driver );
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
			}
		);

		step( 'Can then see the plans page and pick the free plan', async function() {
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

		step( 'Can delete site', async function() {
			const sidebarComponent = await SideBarComponent.Expect( driver );
			await sidebarComponent.ensureSidebarMenuVisible();
			await sidebarComponent.selectSettings();
			const settingsPage = await SettingsPage.Expect( driver );
			return await settingsPage.deleteSite( expectedDomainName );
		} );

		after( 'Can delete our newly created account', async function() {
			return await new DeleteAccountFlow( driver ).deleteAccount( blogName );
		} );
	} );

	describe( 'Sign up for an account only (no site) then add a site @parallel', function() {
		const userName = dataHelper.getNewBlogName();
		const blogName = dataHelper.getNewBlogName();
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );

		before( async function() {
			await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can enter the account flow and see the account details page', async function() {
			await StartPage.Visit(
				driver,
				StartPage.getStartURL( {
					culture: locale,
					flow: 'account',
				} )
			);
			await CreateYourAccountPage.Expect( driver );
		} );

		step( 'Can then enter account details and continue', async function() {
			const emailAddress = dataHelper.getEmailAddress( userName, signupInboxId );
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				userName,
				passwordForTestAccounts
			);
		} );

		step(
			'Can then see the sign up processing page which will finish automatically move along',
			async function() {
				return await new SignUpStep( driver ).continueAlong( blogName, passwordForTestAccounts );
			}
		);

		step(
			'We are then on the Reader page and have no sites - we click Create Site',
			async function() {
				await ReaderPage.Expect( driver );
				const navBarComponent = await NavBarComponent.Expect( driver );
				await navBarComponent.clickMySites();
				const noSitesComponent = await NoSitesComponent.Expect( driver );
				return await noSitesComponent.createSite();
			}
		);

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
			return await new DeleteAccountFlow( driver ).deleteAccount( userName );
		} );
	} );

	describe( 'Sign up for a Reader account @parallel', function() {
		const userName = dataHelper.getNewBlogName();

		before( async function() {
			await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can enter the reader flow and see the Reader landing page', async function() {
			await StartPage.Visit(
				driver,
				StartPage.getStartURL( {
					culture: locale,
					flow: 'reader',
				} )
			);
			return await ReaderLandingPage.Expect( driver );
		} );

		step( 'Can choose Start Using The Reader', async function() {
			const readerLandingPage = await ReaderLandingPage.Expect( driver );
			return await readerLandingPage.clickStartUsingTheReader();
		} );

		step(
			'Can see the account details page and enter account details and continue',
			async function() {
				const emailAddress = dataHelper.getEmailAddress( userName, signupInboxId );
				const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
				return await createYourAccountPage.enterAccountDetailsAndSubmit(
					emailAddress,
					userName,
					passwordForTestAccounts
				);
			}
		);

		step(
			'Can then see the sign up processing page which will finish automatically move along',
			async function() {
				return await new SignUpStep( driver ).continueAlong( userName, passwordForTestAccounts );
			}
		);

		step( 'We are then on the Reader page', async function() {
			return await ReaderPage.Expect( driver );
		} );

		after( 'Can delete our newly created account', async function() {
			return await new DeleteAccountFlow( driver ).deleteAccount( userName );
		} );
	} );

	describe( 'Import a site while signing up @parallel', function() {
		// Currently must use a Wix or GoDaddy site to be importable through this flow.
		const siteURL = 'https://hi6822.wixsite.com/eat-here-its-good';
		const userName = dataHelper.getNewBlogName();
		const emailAddress = dataHelper.getEmailAddress( userName, signupInboxId );

		before( async function() {
			if ( process.env.HORIZON_TESTS === 'true' ) {
				return this.skip();
			}
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can start the import signup flow', async function() {
			return await StartPage.Visit(
				driver,
				StartPage.getStartURL( { culture: locale, flow: 'import', query: `url=${ siteURL }` } )
			);
		} );

		step( 'Can then enter account details and continue', async function() {
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );

			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				userName,
				passwordForTestAccounts
			);
		} );

		step( 'Can then prefill url of site to import using a query param', async function() {
			const importFromURLPage = await ImportFromURLPage.Expect( driver );
			const urlValue = await importFromURLPage.getURLInputValue();

			assert.strictEqual(
				urlValue,
				siteURL,
				"The url input value doesn't match the url query argument"
			);
		} );

		step( 'Can then enter a valid url of a site to import', async function() {
			const importFromURLPage = await ImportFromURLPage.Expect( driver );

			// Invalid URL.
			await importFromURLPage.submitURL( 'foo' );
			await importFromURLPage.errorDisplayed();

			// Wix admin URL.
			await importFromURLPage.submitURL( 'www.wix.com/website/builder' );
			await importFromURLPage.errorDisplayed();

			// Wix URL missing site name.
			await importFromURLPage.submitURL( 'me.wixsite.com' );
			await importFromURLPage.errorDisplayed();

			// Retry checking site importability if there's an error.
			// Cancel test if endpoint still isn't working--can't continue testing this flow.
			let attempts = 2;
			while ( attempts >= 0 ) {
				try {
					await importFromURLPage.submitURL( siteURL );
					return await driverHelper.waitTillNotPresent(
						driver,
						By.css( importFromURLPage.containerSelector )
					);
				} catch ( e ) {
					attempts--;

					const importabilityErrorMessage =
						'There was an error with the importer, please try again.';
					const urlInputMessage = await importFromURLPage.getURLInputMessage();

					// `is-site-importable` was unresponsive or returned an error.
					if ( urlInputMessage === importabilityErrorMessage ) {
						// Last attempt, skip the test.
						if ( attempts < 1 ) {
							await SlackNotifier.warn(
								`Skipping test because checking site importability was retried and was still unsuccessful: ${ e }`,
								{ suppressDuplicateMessages: true }
							);
							return this.skip();
						}

						// More attempts are left, retry site importability check.
						console.log( `Checking site importability didn't work as expected - retrying: ${ e }` );
					} else {
						// Some other error, test failed.
						throw e;
					}
				}
			}
		} );

		step(
			'Can see the domains page prefilled with a suggested domain, and select a free domain',
			async function() {
				const findADomainComponent = await FindADomainComponent.Expect( driver );
				const domainSearch = await findADomainComponent.getSearchInputValue();

				assert.strictEqual(
					domainSearch,
					'eat-here-its-good',
					"The suggested domain doesn't match the import site url"
				);

				await findADomainComponent.waitForResults();
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
				return await new SignUpStep( driver ).continueAlong( userName, passwordForTestAccounts );
			}
		);

		step( 'Can then see the site importer pane and preview site to be imported', async function() {
			const importPage = await ImportPage.Expect( driver );

			// Test that we have opened the correct importer and can see the preview.
			await importPage.siteImporterInputPane();
			await importPage.previewSiteToBeImported();
		} );

		step( 'Can then start an import', async function() {
			const importPage = await ImportPage.Expect( driver );
			await importPage.siteImporterCanStartImport();
		} );

		step( 'Can activate my account from an email', async function() {
			const emailClient = new EmailClient( signupInboxId );
			const validator = emails => emails.find( email => email.subject.includes( 'Activate' ) );
			const emails = await emailClient.pollEmailsByRecipient( emailAddress, validator );
			assert.strictEqual(
				emails.length,
				1,
				'The number of newly registered emails is not equal to 1 (activation)'
			);
			const activationLink = emails[ 0 ].html.links[ 0 ].href;
			assert( activationLink !== undefined, 'Could not locate the activation link email link' );
			await driver.get( activationLink );
		} );

		after( 'Can delete our newly created account', async function() {
			return await new DeleteAccountFlow( driver ).deleteAccount( userName );
		} );
	} );
} );
