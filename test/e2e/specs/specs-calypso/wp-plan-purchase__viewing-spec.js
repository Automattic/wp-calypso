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

describe( `[${ host }] Plans - Viewing: (${ screenSize }) @parallel @jetpack`, function () {
	this.timeout( mochaTimeOut );
	let originalCartAmount;
	let loginFlow;

	before( async function () {
		return await driverManager.ensureNotLoggedIn( this.driver );
	} );

	it( 'Login and select my site', async function () {
		loginFlow = new LoginFlow( this.driver );
		return await loginFlow.loginAndSelectMySite();
	} );

	it( 'Select plans', async function () {
		const sideBarComponent = await SidebarComponent.Expect( this.driver );
		return await sideBarComponent.selectPlans();
	} );

	it( 'Compare plans', async function () {
		const plansPage = await PlansPage.Expect( this.driver );
		await plansPage.openPlansTab();
		if ( host === 'WPCOM' ) {
			await plansPage.openAdvancedPlansSegment();
		}
		return await plansPage.waitForComparison();
	} );

	it( 'Select Business plan', async function () {
		const plansPage = await PlansPage.Expect( this.driver );
		return await plansPage.selectPaidPlan();
	} );

	it( 'Remove any existing coupon', async function () {
		const securePaymentComponent = await SecurePaymentComponent.Expect( this.driver );

		if ( await securePaymentComponent.hasCouponApplied() ) {
			await securePaymentComponent.removeCoupon();
		}
	} );

	it( 'Apply coupon', async function () {
		const securePaymentComponent = await SecurePaymentComponent.Expect( this.driver );

		await securePaymentComponent.toggleCartSummary();
		originalCartAmount = await securePaymentComponent.cartTotalAmount();

		await securePaymentComponent.enterCouponCode( dataHelper.getTestCouponCode() );

		const newCartAmount = await securePaymentComponent.cartTotalAmount();
		const expectedCartAmount =
			Math.round( ( originalCartAmount * 0.99 + Number.EPSILON ) * 100 ) / 100;

		assert.strictEqual( newCartAmount, expectedCartAmount, 'Coupon not applied properly' );
	} );

	it( 'Remove coupon', async function () {
		const securePaymentComponent = await SecurePaymentComponent.Expect( this.driver );

		await securePaymentComponent.removeCoupon();

		const removedCouponAmount = await securePaymentComponent.cartTotalAmount();
		assert.strictEqual( removedCouponAmount, originalCartAmount, 'Coupon not removed properly' );
	} );

	it( 'Remove Business plan', async function () {
		const securePaymentComponent = await SecurePaymentComponent.Expect( this.driver );

		return await securePaymentComponent.removeBusinessPlan();
	} );

	it( 'Redirect back to Plans page', async function () {
		await PlansPage.Expect( this.driver ); // Redirect means the plan was successfully removed
	} );
} );
