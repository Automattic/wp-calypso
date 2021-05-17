/**
 * External dependencies
 */
import config from 'config';
import assert from 'assert';

/**
 * Internal dependencies
 */
import * as driverManager from '../../lib/driver-manager.js';
import * as dataHelper from '../../lib/data-helper';

import LoginFlow from '../../lib/flows/login-flow.js';
import SecurePaymentComponent from '../../lib/components/secure-payment-component';
import NavBarComponent from '../../lib/components/nav-bar-component';
import ProfilePage from '../../lib/pages/profile-page';
import PurchasesPage from '../../lib/pages/purchases-page';
import ManagePurchasePage from '../../lib/pages/manage-purchase-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Plans: (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );
	let driver;

	before( 'Start browser', async function () {
		this.timeout( startBrowserTimeoutMS );
		driver = await driverManager.startBrowser();
	} );

	describe( 'Renew a plan:  @parallel', function () {
		before( async function () {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		it( 'Can log into WordPress.com', async function () {
			const loginFlow = new LoginFlow( driver );
			return await loginFlow.login();
		} );

		it( 'Can navigate to purchases', async function () {
			const navBarComponent = await NavBarComponent.Expect( driver );
			await navBarComponent.clickProfileLink();
			const profilePage = await ProfilePage.Expect( driver );
			await profilePage.chooseManagePurchases();
			const purchasesPage = await PurchasesPage.Expect( driver );
			await purchasesPage.dismissGuidedTour();
			return await purchasesPage.selectPremiumPlanOnConnectedSite();
		} );

		it( '"Renew Now" link takes user to Payment Details form', async function () {
			const managePurchasePage = await ManagePurchasePage.Expect( driver );
			await managePurchasePage.chooseRenewNow();
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
			const premiumPlanInCart = await securePaymentComponent.containsPremiumPlan();
			return assert.strictEqual(
				premiumPlanInCart,
				true,
				"The cart doesn't contain the premium plan"
			);
		} );
	} );
} );
