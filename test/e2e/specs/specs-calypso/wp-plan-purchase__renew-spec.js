import assert from 'assert';
import config from 'config';
import NavBarComponent from '../../lib/components/nav-bar-component';
import SecurePaymentComponent from '../../lib/components/secure-payment-component';
import * as dataHelper from '../../lib/data-helper';
import * as driverManager from '../../lib/driver-manager.js';
import LoginFlow from '../../lib/flows/login-flow.js';
import ManagePurchasePage from '../../lib/pages/manage-purchase-page';
import ProfilePage from '../../lib/pages/profile-page';
import PurchasesPage from '../../lib/pages/purchases-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Plans - Renew: (${ screenSize }) @parallel`, function () {
	this.timeout( mochaTimeOut );

	before( async function () {
		return await driverManager.ensureNotLoggedIn( this.driver );
	} );

	it( 'Can log into WordPress.com', async function () {
		const loginFlow = new LoginFlow( this.driver );
		return await loginFlow.login();
	} );

	it( 'Can navigate to purchases', async function () {
		const navBarComponent = await NavBarComponent.Expect( this.driver );
		await navBarComponent.clickProfileLink();
		const profilePage = await ProfilePage.Expect( this.driver );
		await profilePage.chooseManagePurchases();
		const purchasesPage = await PurchasesPage.Expect( this.driver );
		await purchasesPage.dismissGuidedTour();
		return await purchasesPage.selectPremiumPlanOnConnectedSite();
	} );

	it( '"Renew Now" link takes user to Payment Details form', async function () {
		const managePurchasePage = await ManagePurchasePage.Expect( this.driver );
		await managePurchasePage.chooseRenewNow();
		const securePaymentComponent = await SecurePaymentComponent.Expect( this.driver );
		const premiumPlanInCart = await securePaymentComponent.containsPremiumPlan();
		return assert.strictEqual(
			premiumPlanInCart,
			true,
			"The cart doesn't contain the premium plan"
		);
	} );
} );
