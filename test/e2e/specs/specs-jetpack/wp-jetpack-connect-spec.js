/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';

/**
 * Internal dependencies
 */

import LoginFlow from '../../lib/flows/login-flow';
import SignUpFlow from '../../lib/flows/sign-up-flow';

import JetpackAuthorizePage from '../../lib/pages/jetpack-authorize-page';
import PickAPlanPage from '../../lib/pages/signup/pick-a-plan-page';
import WPAdminJetpackPage from '../../lib/pages/wp-admin/wp-admin-jetpack-page.js';
import WPAdminDashboardPage from '../../lib/pages/wp-admin/wp-admin-dashboard-page';
import WPAdminNewUserPage from '../../lib/pages/wp-admin/wp-admin-new-user-page';
import WPAdminLogonPage from '../../lib/pages/wp-admin/wp-admin-logon-page';
import WPAdminSidebar from '../../lib/pages/wp-admin/wp-admin-sidebar.js';
import JetpackConnectFlow from '../../lib/flows/jetpack-connect-flow';
import JetpackConnectPage from '../../lib/pages/jetpack/jetpack-connect-page';
import LoginPage from '../../lib/pages/login-page';
import JetpackComPage from '../../lib/pages/external/jetpackcom-page';
import JetpackComFeaturesDesignPage from '../../lib/pages/external/jetpackcom-features-design-page';

import * as driverManager from '../../lib/driver-manager';
import * as driverHelper from '../../lib/driver-helper';
import * as dataHelper from '../../lib/data-helper';
import JetpackComPricingPage from '../../lib/pages/external/jetpackcom-pricing-page';
import SecurePaymentComponent from '../../lib/components/secure-payment-component';
import WPHomePage from '../../lib/pages/wp-home-page';
import ThankYouModalComponent from '../../lib/components/thank-you-modal-component';
import MyPlanPage from '../../lib/pages/my-plan-page';
import WPAdminInPlaceApprovePage from '../../lib/pages/wp-admin/wp-admin-in-place-approve-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const signupInboxId = config.get( 'signupInboxId' );
const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
const sandboxCookieValue = config.get( 'storeSandboxCookieValue' );
const locale = driverManager.currentLocale();
const siteName = dataHelper.getJetpackSiteName();

describe( `Jetpack Connect: (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Connect From wp-admin: @parallel @jetpack @canary', function () {
		before( async function () {
			return await driverManager.ensureNotLoggedIn( this.driver );
		} );

		it( 'Can log in to WPCOM', async function () {
			const loginFlow = new LoginFlow( this.driver, 'jetpackConnectUser' );
			await loginFlow.login();
		} );

		it( 'Can create wporg site', async function () {
			this.timeout( mochaTimeOut * 12 );

			this.jnFlow = new JetpackConnectFlow( this.driver, null );
			return await this.jnFlow.createJNSite();
		} );

		it( 'Can navigate to the Jetpack dashboard', async function () {
			await WPAdminSidebar.refreshIfJNError( this.driver );
			this.wpAdminSidebar = await WPAdminSidebar.Expect( this.driver );
			return await this.wpAdminSidebar.selectJetpack();
		} );

		it( 'Can click the Connect Jetpack button', async function () {
			await driverHelper.refreshIfJNError( this.driver );
			this.wpAdminJetpack = await WPAdminJetpackPage.Expect( this.driver );
			return await this.wpAdminJetpack.inPlaceConnect();
		} );

		it( 'Can Approve in-place connection', async function () {
			const inPlaceApprovePage = await WPAdminInPlaceApprovePage.Expect( this.driver );
			await inPlaceApprovePage.approve();
		} );

		it( 'Can click the free plan button', async function () {
			const pickAPlanPage = await PickAPlanPage.Expect( this.driver );
			return await pickAPlanPage.selectFreePlanJetpack();
		} );

		it( 'Can assert we are on Jetpack Dashboard', async function () {
			await WPAdminJetpackPage.Expect( this.driver );
		} );
	} );

	describe( 'Pre-connect from Jetpack.com using free plan: @parallel @jetpack', function () {
		before( async function () {
			return await driverManager.ensureNotLoggedIn( this.driver );
		} );

		it( 'Can select Get Started', async function () {
			const jetPackComPage = await JetpackComPage.Visit( this.driver );
			return await jetPackComPage.selectGetStarted();
		} );

		it( 'Can select free plan', async function () {
			const pickAPlanPage = await PickAPlanPage.Expect( this.driver );
			return await pickAPlanPage.selectFreePlanJetpack();
		} );

		it( 'Can see Jetpack connect page', async function () {
			return await JetpackConnectPage.Expect( this.driver );
		} );
	} );

	describe( 'Connect via SSO: @parallel @jetpack', function () {
		before( async function () {
			return await driverManager.ensureNotLoggedIn( this.driver );
		} );

		it( 'Can register new Subscriber user', async function () {
			this.accountName = dataHelper.getNewBlogName();
			this.emailAddress = dataHelper.getEmailAddress( this.accountName, signupInboxId );
			this.password = config.get( 'passwordForNewTestSignUps' );
			const signupFlow = new SignUpFlow( this.driver, {
				accountName: this.accountName,
				emailAddress: this.emailAddress,
				password: this.password,
			} );
			await signupFlow.signupFreeAccount();
			await signupFlow.activateAccount();
			return await driverManager.ensureNotLoggedIn( this.driver );
		} );

		it( 'Can log into WordPress.com', async function () {
			return await new LoginFlow( this.driver ).login();
		} );

		it( 'Can log into site via Jetpack SSO', async function () {
			const loginPage = await WPAdminLogonPage.Visit(
				this.driver,
				dataHelper.getJetpackSiteName()
			);
			return await loginPage.logonSSO();
		} );

		it( 'Add new user as Subscriber in wp-admin', async function () {
			await WPAdminSidebar.refreshIfJNError( this.driver );
			const wpAdminSidebar = await WPAdminSidebar.Expect( this.driver );
			await wpAdminSidebar.selectAddNewUser();
			await WPAdminNewUserPage.refreshIfJNError( this.driver );
			const wpAdminNewUserPage = await WPAdminNewUserPage.Expect( this.driver );
			return await wpAdminNewUserPage.addUser( this.emailAddress );
		} );

		it( 'Log out from WP Admin', async function () {
			await driverManager.ensureNotLoggedIn( this.driver );
			await WPAdminDashboardPage.refreshIfJNError( this.driver );
			const wPAdminDashboardPage = await WPAdminDashboardPage.Visit(
				this.driver,
				WPAdminDashboardPage.getUrl( siteName )
			);
			return await wPAdminDashboardPage.logout();
		} );

		it( 'Can log in as Subscriber', async function () {
			const loginPage = await LoginPage.Visit( this.driver );
			return await loginPage.login( this.accountName, this.password );
		} );

		it( 'Can login via SSO into WP Admin', async function () {
			const wpAdminLogonPage = await WPAdminLogonPage.Visit( this.driver, siteName );
			await wpAdminLogonPage.logonSSO();
			const jetpackAuthorizePage = await JetpackAuthorizePage.Expect( this.driver );
			return await jetpackAuthorizePage.approveSSOConnection();
		} );
	} );

	describe( 'Pre-connect from Jetpack.com using "Install Jetpack" button: @parallel @jetpack', function () {
		before( async function () {
			return await driverManager.ensureNotLoggedIn( this.driver );
		} );

		it( 'Can select Install Jetpack on Design Page', async function () {
			const jetpackComFeaturesDesignPage = await JetpackComFeaturesDesignPage.Visit( this.driver );
			return await jetpackComFeaturesDesignPage.installJetpack();
		} );

		it( 'Can see Jetpack connect page', async function () {
			return await JetpackConnectPage.Expect( this.driver );
		} );
	} );

	describe( 'Connect from Jetpack.com Pricing page and buy paid plan: @parallel @jetpack', function () {
		let jnFlow;

		before( async function () {
			return await driverManager.ensureNotLoggedIn( this.driver );
		} );

		it( 'We can set the sandbox cookie for payments', async function () {
			const wpHomePage = await WPHomePage.Visit( this.driver );
			await wpHomePage.checkURL( locale );
			return await wpHomePage.setSandboxModeForPayments( sandboxCookieValue );
		} );

		it( 'Can create wporg site', async function () {
			this.timeout( mochaTimeOut * 12 );

			jnFlow = new JetpackConnectFlow( this.driver );
			return await jnFlow.createJNSite();
		} );

		it( 'Can select buy Jetpack Security on Pricing Page', async function () {
			const jetpackComPricingPage = await JetpackComPricingPage.Visit( this.driver );
			return await jetpackComPricingPage.buyJetpackPlan( 'jetpack_security_daily' );
		} );

		it( 'Can start connection flow using JN site', async function () {
			const jetPackConnectPage = await JetpackConnectPage.Expect( this.driver );
			return await jetPackConnectPage.addSiteUrl( jnFlow.url );
		} );

		it( 'Can log into WP.com', async function () {
			const user = dataHelper.getAccountConfig( 'jetpackConnectUser' );
			const loginPage = await LoginPage.Expect( this.driver );
			return await loginPage.login( user[ 0 ], user[ 1 ] );
		} );

		it( 'Can wait for Jetpack get connected', async function () {
			const jetpackAuthorizePage = await JetpackAuthorizePage.Expect( this.driver );
			return await jetpackAuthorizePage.waitToDisappear();
		} );

		it( 'Can see the secure payment page and enter/submit test payment details', async function () {
			const securePaymentComponent = await SecurePaymentComponent.Expect( this.driver );
			const securityPlanInCart = await securePaymentComponent.containsPlan(
				'jetpack_security_daily'
			);
			assert.strictEqual( securityPlanInCart, true, "The cart doesn't contain the security plan" );
			await securePaymentComponent.payWithStoredCardIfPossible( testCreditCardDetails );
			await securePaymentComponent.waitForCreditCardPaymentProcessing();
			return await securePaymentComponent.waitForPageToDisappear();
		} );

		it( 'Can see Jetpack Security plan', async function () {
			const thankYouModal = await ThankYouModalComponent.Expect( this.driver );
			await thankYouModal.continue();

			const myPlanPage = await MyPlanPage.Expect( this.driver );
			const isSecurity = await myPlanPage.isSecurityPlan();
			assert( isSecurity, 'Can not verify Security plan' );
		} );
	} );
} );
