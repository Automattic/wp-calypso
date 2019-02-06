/** @format */

import config from 'config';
import assert from 'assert';

import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper';

import LoginFlow from '../lib/flows/login-flow.js';

import PlansPage from '../lib/pages/plans-page.js';
import StatsPage from '../lib/pages/stats-page.js';

import SidebarComponent from '../lib/components/sidebar-component.js';
import SecurePaymentComponent from '../lib/components/secure-payment-component';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Plans: (${ screenSize }) @jetpack`, function() {
	this.timeout( mochaTimeOut );

	describe( 'Comparing Plans:', function() {
		step( 'Login and Select My Site', async function() {
			const loginFlow = new LoginFlow( driver );
			return await loginFlow.loginAndSelectMySite();
		} );

		step( 'Can Select Plans', async function() {
			const statsPage = await StatsPage.Expect( driver );
			await statsPage.waitForPage();
			const sideBarComponent = await SidebarComponent.Expect( driver );
			return await sideBarComponent.selectPlan();
		} );

		step( 'Can See Plans', async function() {
			return await PlansPage.Expect( driver );
		} );

		step( 'Can Compare Plans', async function() {
			const plansPage = await PlansPage.Expect( driver );
			if ( host === 'WPCOM' ) {
				await plansPage.openPlansTab();
				return await plansPage.waitForComparison();
			}

			// Jetpack
			const displayed = await plansPage.planTypesShown( 'jetpack' );
			return assert( displayed, 'The Jetpack plans are NOT displayed' );
		} );

		if ( host === 'WPCOM' ) {
			step( 'Can Verify Current Plan', async function() {
				const planName = 'premium';
				const plansPage = await PlansPage.Expect( driver );
				const present = await plansPage.confirmCurrentPlan( planName );
				return assert( present, `Failed to detect correct plan (${ planName })` );
			} );
		}
	} );

	describe( 'Viewing a specific plan with coupon:', function() {
		let originalCartAmount, loginFlow;

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Login and Select My Site', async function() {
			loginFlow = new LoginFlow( driver );
			return await loginFlow.loginAndSelectMySite();
		} );

		step( 'Can Select Plans', async function() {
			const statsPage = await StatsPage.Expect( driver );
			await statsPage.waitForPage();
			const sideBarComponent = await SidebarComponent.Expect( driver );
			return await sideBarComponent.selectPlan();
		} );

		step( 'Can Select Plans tab', async function() {
			const plansPage = await PlansPage.Expect( driver );
			if ( host === 'WPCOM' ) {
				await plansPage.openPlansTab();
				return await plansPage.waitForComparison();
			}

			// Jetpack
			const displayed = await plansPage.planTypesShown( 'jetpack' );
			return assert( displayed, 'The Jetpack plans are NOT displayed' );
		} );

		step( 'Select Business Plan', async function() {
			const plansPage = await PlansPage.Expect( driver );
			return await plansPage.selectBusinessPlan();
		} );

		step( 'Remove any existing coupon', async function() {
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );

			if ( await securePaymentComponent.hasCouponApplied() ) {
				await securePaymentComponent.removeCoupon();
			}
		} );

		step( 'Can Correctly Apply Coupon', async function() {
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );

			await securePaymentComponent.toggleCartSummary();
			originalCartAmount = await securePaymentComponent.cartTotalAmount();

			await securePaymentComponent.enterCouponCode( dataHelper.getTestCouponCode() );

			let newCartAmount = await securePaymentComponent.cartTotalAmount();
			let expectedCartAmount = parseFloat( ( originalCartAmount * 0.99 ).toFixed( 2 ) );

			assert.strictEqual( newCartAmount, expectedCartAmount, 'Coupon not applied properly' );
		} );

		step( 'Can Remove Coupon', async function() {
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );

			await securePaymentComponent.removeCoupon();

			let removedCouponAmount = await securePaymentComponent.cartTotalAmount();
			assert.strictEqual( removedCouponAmount, originalCartAmount, 'Coupon not removed properly' );
		} );

		step( 'Remove from cart', async function() {
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );

			return await securePaymentComponent.removeFromCart();
		} );
	} );
} );
