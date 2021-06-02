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
import PlansPage from '../../lib/pages/plans-page.js';
import SidebarComponent from '../../lib/components/sidebar-component.js';
import SecurePaymentComponent from '../../lib/components/secure-payment-component';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Plans - Upgrade: (${ screenSize }) @parallel @jetpack`, function () {
	this.timeout( mochaTimeOut );

	before( async function () {
		return await driverManager.ensureNotLoggedIn( this.driver );
	} );

	it( 'Can log into WordPress.com', async function () {
		const loginFlow = new LoginFlow( this.driver );
		return await loginFlow.loginAndSelectMySite();
	} );

	it( 'Can navigate to plans page and select business plan', async function () {
		const sidebarComponent = await SidebarComponent.Expect( this.driver );
		await sidebarComponent.selectPlans();
		const plansPage = await PlansPage.Expect( this.driver );
		await plansPage.openPlansTab();
		return await plansPage.selectPaidPlan();
	} );

	it( 'User is taken to be Payment Details form', async function () {
		const securePaymentComponent = await SecurePaymentComponent.Expect( this.driver );
		const businessPlanInCart = await securePaymentComponent.containsBusinessPlan();
		return assert.strictEqual(
			businessPlanInCart,
			true,
			"The cart doesn't contain the business plan"
		);
	} );
} );
