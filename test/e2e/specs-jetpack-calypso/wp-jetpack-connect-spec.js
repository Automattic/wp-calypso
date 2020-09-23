/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow';
import SignUpFlow from '../lib/flows/sign-up-flow';

import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';
import PickAPlanPage from '../lib/pages/signup/pick-a-plan-page';
import WPAdminJetpackPage from '../lib/pages/wp-admin/wp-admin-jetpack-page.js';
import WPAdminDashboardPage from '../lib/pages/wp-admin/wp-admin-dashboard-page';
import WPAdminNewUserPage from '../lib/pages/wp-admin/wp-admin-new-user-page';
import WPAdminLogonPage from '../lib/pages/wp-admin/wp-admin-logon-page';
import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar.js';
import JetpackConnectFlow from '../lib/flows/jetpack-connect-flow';
import JetpackConnectPage from '../lib/pages/jetpack/jetpack-connect-page';
import LoginPage from '../lib/pages/login-page';
import JetpackComPage from '../lib/pages/external/jetpackcom-page';
import JetpackComFeaturesDesignPage from '../lib/pages/external/jetpackcom-features-design-page';
import WooWizardSetupPage from '../lib/pages/woocommerce/woo-wizard-setup-page';
import WooWizardJetpackPage from '../lib/pages/woocommerce/woo-wizard-jetpack-page';

import * as driverManager from '../lib/driver-manager';
import * as driverHelper from '../lib/driver-helper';
import * as dataHelper from '../lib/data-helper';
import JetpackComPricingPage from '../lib/pages/external/jetpackcom-pricing-page';
import SecurePaymentComponent from '../lib/components/secure-payment-component';
import WPHomePage from '../lib/pages/wp-home-page';
import ThankYouModalComponent from '../lib/components/thank-you-modal-component';
import MyPlanPage from '../lib/pages/my-plan-page';
import WooWizardWelcomePage from '../lib/pages/woocommerce/woo-wizard-welcome-page';
import WooWizardIndustryPage from '../lib/pages/woocommerce/woo-wizard-industry-page';
import WooWizardProductPage from '../lib/pages/woocommerce/woo-wizard-product-page';
import WooWizardBusinessDetailsPage from '../lib/pages/woocommerce/woo-wizard-business-details-page';
import WooWizardThemePage from '../lib/pages/woocommerce/woo-wizard-theme-page';
import WPAdminInPlaceApprovePage from '../lib/pages/wp-admin/wp-admin-in-place-approve-page';
import WPAdminInPlacePlansPage from '../lib/pages/wp-admin/wp-admin-in-place-plans-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const signupInboxId = config.get( 'signupInboxId' );
const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
const sandboxCookieValue = config.get( 'storeSandboxCookieValue' );
const locale = driverManager.currentLocale();
const siteName = dataHelper.getJetpackSiteName();

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `Jetpack Connect: (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	// Expired sites cleanup is moved to async job: `e2e_jetpack_cleanup_user`
	describe.skip( 'Disconnect expired sites: @parallel @jetpack @canary', function () {
		const timeout = mochaTimeOut * 10;

		this.timeout( timeout );

		before( async function () {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can disconnect any expired sites', async function () {
			return await new JetpackConnectFlow( driver, 'jetpackConnectUser' ).removeSites( timeout );
		} );
	} );

	describe( 'Connect From wp-admin: @parallel @jetpack @canary', function () {
		before( async function () {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can log in to WPCOM', async function () {
			const loginFlow = new LoginFlow( driver, 'jetpackConnectUser' );
			await loginFlow.login();
		} );

		step( 'Can create wporg site', async function () {
			this.timeout( mochaTimeOut * 12 );

			this.jnFlow = new JetpackConnectFlow( driver, null );
			return await this.jnFlow.createJNSite();
		} );

		step( 'Can navigate to the Jetpack dashboard', async function () {
			await WPAdminSidebar.refreshIfJNError( driver );
			this.wpAdminSidebar = await WPAdminSidebar.Expect( driver );
			return await this.wpAdminSidebar.selectJetpack();
		} );

		step( 'Can click the Connect Jetpack button', async function () {
			await driverHelper.refreshIfJNError( driver );
			this.wpAdminJetpack = await WPAdminJetpackPage.Expect( driver );
			return await this.wpAdminJetpack.inPlaceConnect();
		} );

		step( 'Can Approve in-place connection', async function () {
			const inPlaceApprovePage = await WPAdminInPlaceApprovePage.Expect( driver );
			await inPlaceApprovePage.approve();
		} );

		step( 'Can click the free plan button', async function () {
			const pickAPlanPage = await WPAdminInPlacePlansPage.Expect( driver );
			return await pickAPlanPage.selectFreePlan();
		} );

		step( 'Can assert we are on Jetpack Dashboard', async function () {
			await WPAdminJetpackPage.Expect( driver );
		} );
	} );

	describe( 'Pre-connect from Jetpack.com using free plan: @parallel @jetpack', function () {
		before( async function () {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can select Get Started', async function () {
			const jetPackComPage = await JetpackComPage.Visit( driver );
			return await jetPackComPage.selectGetStarted();
		} );

		step( 'Can select free plan', async function () {
			const pickAPlanPage = await PickAPlanPage.Expect( driver );
			return await pickAPlanPage.selectFreePlanJetpack();
		} );

		step( 'Can see Jetpack connect page', async function () {
			return await JetpackConnectPage.Expect( driver );
		} );
	} );

	describe( 'Connect via SSO: @parallel @jetpack', function () {
		before( async function () {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can register new Subscriber user', async function () {
			this.accountName = dataHelper.getNewBlogName();
			this.emailAddress = dataHelper.getEmailAddress( this.accountName, signupInboxId );
			this.password = config.get( 'passwordForNewTestSignUps' );
			const signupFlow = new SignUpFlow( driver, {
				accountName: this.accountName,
				emailAddress: this.emailAddress,
				password: this.password,
			} );
			await signupFlow.signupFreeAccount();
			await signupFlow.activateAccount();
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can log into WordPress.com', async function () {
			return await new LoginFlow( driver ).login();
		} );

		step( 'Can log into site via Jetpack SSO', async function () {
			const loginPage = await WPAdminLogonPage.Visit( driver, dataHelper.getJetpackSiteName() );
			return await loginPage.logonSSO();
		} );

		step( 'Add new user as Subscriber in wp-admin', async function () {
			await WPAdminSidebar.refreshIfJNError( driver );
			const wpAdminSidebar = await WPAdminSidebar.Expect( driver );
			await wpAdminSidebar.selectAddNewUser();
			await WPAdminNewUserPage.refreshIfJNError( driver );
			const wpAdminNewUserPage = await WPAdminNewUserPage.Expect( driver );
			return await wpAdminNewUserPage.addUser( this.emailAddress );
		} );

		step( 'Log out from WP Admin', async function () {
			await driverManager.ensureNotLoggedIn( driver );
			await WPAdminDashboardPage.refreshIfJNError( driver );
			const wPAdminDashboardPage = await WPAdminDashboardPage.Visit(
				driver,
				WPAdminDashboardPage.getUrl( siteName )
			);
			return await wPAdminDashboardPage.logout();
		} );

		step( 'Can log in as Subscriber', async function () {
			const loginPage = await LoginPage.Visit( driver );
			return await loginPage.login( this.accountName, this.password );
		} );

		step( 'Can login via SSO into WP Admin', async function () {
			const wpAdminLogonPage = await WPAdminLogonPage.Visit( driver, siteName );
			await wpAdminLogonPage.logonSSO();
			const jetpackAuthorizePage = await JetpackAuthorizePage.Expect( driver );
			return await jetpackAuthorizePage.approveSSOConnection();
		} );
	} );

	describe( 'Pre-connect from Jetpack.com using "Install Jetpack" button: @parallel @jetpack', function () {
		before( async function () {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can select Install Jetpack on Design Page', async function () {
			const jetpackComFeaturesDesignPage = await JetpackComFeaturesDesignPage.Visit( driver );
			return await jetpackComFeaturesDesignPage.installJetpack();
		} );

		step( 'Can see Jetpack connect page', async function () {
			return await JetpackConnectPage.Expect( driver );
		} );
	} );

	describe( 'Connect from Jetpack.com Pricing page and buy paid plan: @parallel @jetpack', function () {
		let jnFlow;

		before( async function () {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'We can set the sandbox cookie for payments', async function () {
			const wpHomePage = await WPHomePage.Visit( driver );
			await wpHomePage.checkURL( locale );
			return await wpHomePage.setSandboxModeForPayments( sandboxCookieValue );
		} );

		step( 'Can create wporg site', async function () {
			this.timeout( mochaTimeOut * 12 );

			jnFlow = new JetpackConnectFlow( driver );
			return await jnFlow.createJNSite();
		} );

		step( 'Can select buy Premium on Pricing Page', async function () {
			const jetpackComPricingPage = await JetpackComPricingPage.Visit( driver );
			return await jetpackComPricingPage.buyPremium();
		} );

		step( 'Can start connection flow using JN site', async function () {
			const jetPackConnectPage = await JetpackConnectPage.Expect( driver );
			return await jetPackConnectPage.addSiteUrl( jnFlow.url );
		} );

		step( 'Can log into WP.com', async function () {
			const user = dataHelper.getAccountConfig( 'jetpackConnectUser' );
			const loginPage = await LoginPage.Expect( driver );
			return await loginPage.login( user[ 0 ], user[ 1 ] );
		} );

		step( 'Can wait for Jetpack get connected', async function () {
			const jetpackAuthorizePage = await JetpackAuthorizePage.Expect( driver );
			return await jetpackAuthorizePage.waitToDisappear();
		} );

		step(
			'Can see the secure payment page and enter/submit test payment details',
			async function () {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
				await securePaymentComponent.payWithStoredCardIfPossible( testCreditCardDetails );
				await securePaymentComponent.waitForCreditCardPaymentProcessing();
				return await securePaymentComponent.waitForPageToDisappear();
			}
		);

		step( 'Can see Premium plan', async function () {
			const thankYouModal = await ThankYouModalComponent.Expect( driver );
			await thankYouModal.continue();

			const myPlanPage = await MyPlanPage.Expect( driver );
			const isPremium = await myPlanPage.isPremium();
			assert( isPremium, 'Can not verify Premium plan' );
		} );
	} );

	// The Woo wizard is just not reliable.
	describe.skip( 'Connect From WooCommerce plugin when Jetpack is not installed: @parallel @jetpack', function () {
		const countryCode = 'US';
		const stateCode = 'CO';
		const address = '2101 Blake St';
		const address2 = '';
		const city = 'Denver';
		const postalCode = '80205';

		before( async function () {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can login into WordPress.com', async function () {
			const loginFlow = new LoginFlow( driver, 'jetpackConnectUser' );
			return await loginFlow.login();
		} );

		step( 'Can create wporg site', async function () {
			this.timeout( mochaTimeOut * 12 );

			this.jnFlow = new JetpackConnectFlow( driver, null, 'wooCommerceNoJetpack' );
			return await this.jnFlow.createJNSite();
		} );

		step( 'Can enter WooCommerce Wizard', async function () {
			await WPAdminDashboardPage.refreshIfJNError( driver );
			const wPAdminDashboardPage = await WPAdminDashboardPage.Expect( driver );
			return await wPAdminDashboardPage.enterWooCommerceWizard();
		} );

		step( 'Can fill out and submit store information form', async function () {
			await ( await WooWizardWelcomePage.Expect( driver ) ).start();
			const wooWizardSetupPage = await WooWizardSetupPage.Expect( driver );
			return await wooWizardSetupPage.enterStoreDetailsAndSubmit( {
				countryCode,
				stateCode,
				address,
				address2,
				city,
				postalCode,
			} );
		} );

		step( 'Can select fashion industry', async function () {
			await ( await WooWizardIndustryPage.Expect( driver ) ).selectFashionIndustry();
		} );
		step( 'Can select product type', async function () {
			await ( await WooWizardProductPage.Expect( driver ) ).selectPhysicalProduct();
		} );

		step( 'Can fill business details', async function () {
			await ( await WooWizardBusinessDetailsPage.Expect( driver ) ).fillBusinessInfo();
		} );

		step( 'Can skip theme step', async function () {
			await ( await WooWizardThemePage.Expect( driver ) ).skip();
		} );

		// @TODO: Fix me! Disabled on May 23rd 2019 since the flow was getting stuck there.
		// Passes locally and in manual testing, so we suspect it's the way how
		// Calypso live-branches URL is passed to this step.
		// /*
		step( 'Can continue with Jetpack', async function () {
			this.timeout( mochaTimeOut * 5 );

			const wooWizardJetpackPage = await WooWizardJetpackPage.Expect( driver );
			return await wooWizardJetpackPage.selectContinueWithJetpack();
		} );

		step( 'Can wait for Jetpack get connected', async function () {
			const jetpackAuthorizePage = await JetpackAuthorizePage.Expect( driver );
			// HACKY. Connection should be auto-approved, but it fails all the time, so we need to manually click the button
			return await jetpackAuthorizePage.approveConnection();
		} );

		step( 'Can click the free plan button', async function () {
			const pickAPlanPage = await PickAPlanPage.Expect( driver );
			return await pickAPlanPage.selectFreePlanJetpack();
		} );

		// Ignored for now. Discussion (internal ref): p1556635263170900-slack-proton
		// step( 'Can see the Woo wizard ready page', async function() {
		// 	return await WooWizardReadyPage.Expect( driver );
		// } );
		// */
	} );
} );
