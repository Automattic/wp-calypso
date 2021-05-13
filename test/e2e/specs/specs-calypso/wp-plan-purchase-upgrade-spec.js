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

const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Plans: (${ screenSize })`, function () {
	let driver;

	beforeAll( async function () {
		driver = await driverManager.startBrowser();
	}, startBrowserTimeoutMS );

	describe( 'Upgrade a plan:  @parallel @jetpack', function () {
		beforeAll( async function () {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		it( 'Can log into WordPress.com', async function () {
			const loginFlow = new LoginFlow( driver );
			return await loginFlow.loginAndSelectMySite();
		} );

		it( 'Can navigate to plans page and select business plan', async function () {
			const sidebarComponent = await SidebarComponent.Expect( driver );
			await sidebarComponent.selectPlans();
			const plansPage = await PlansPage.Expect( driver );
			await plansPage.openPlansTab();
			return await plansPage.selectPaidPlan();
		} );

		it( 'User is taken to be Payment Details form', async function () {
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
			const businessPlanInCart = await securePaymentComponent.containsBusinessPlan();
			return assert.strictEqual(
				businessPlanInCart,
				true,
				"The cart doesn't contain the business plan"
			);
		} );
	} );
} );
