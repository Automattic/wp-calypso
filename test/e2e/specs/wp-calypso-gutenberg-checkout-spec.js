/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';
import config from 'config';
import assert from 'assert';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow.js';

import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component';
import SecurePaymentComponent from '../lib/components/secure-payment-component.js';

import * as driverManager from '../lib/driver-manager';
import * as driverHelper from '../lib/driver-helper';
import * as dataHelper from '../lib/data-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Calypso Gutenberg Editor: Checkout (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Can Trigger The Checkout Modal via Post Editor', function () {
		step( 'Can Log In', async function () {
			this.loginFlow = new LoginFlow( driver, 'gutenbergSimpleSiteFreePlanUser' );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can Insert The Premium Block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.addBlock( 'Simple Payments' );
			return await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.wp-block-jetpack-simple-payments' )
			);
		} );

		step( 'Premium Block Has Clickable Upgrade Button Displayed', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.clickUpgradeOnPremiumBlock();
			return await driver.switchTo().defaultContent();
		} );

		step( 'Can View Checkout Modal', async function () {
			await driverHelper.waitTillPresentAndDisplayed( driver, By.css( '.editor-checkout-modal' ) );
			const compositeCheckoutIsPresent = await driverHelper.isElementPresent(
				driver,
				By.css( '.editor-checkout-modal' )
			);
			assert.strictEqual(
				compositeCheckoutIsPresent,
				true,
				'The in-editor checkout is not present'
			);
		} );
	} );

	describe( 'Has Correct Plan Details', function () {
		step( 'Contains Premium Plan', async function () {
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
			const checkoutContainsPremiumPlan = await securePaymentComponent.containsPremiumPlan();
			assert.strictEqual(
				checkoutContainsPremiumPlan,
				true,
				'The in-editor checkout does not contain the expected Premium Plan'
			);
		} );

		step( 'Can Change Plan Length', async function () {
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
			const originalCartAmount = await securePaymentComponent.cartTotalAmount();
			await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.wp-checkout__review-order-step .checkout-step__edit-button' )
			);
			await driverHelper.clickWhenClickable(
				driver,
				By.css( '.wp-checkout__review-order-step .checkout-step__edit-button' )
			);
			const twoYearPlan = await driver.findElement(
				By.css( '.wp-checkout__review-order-step ul > li:nth-child(2) > div' )
			);
			await twoYearPlan.click();
			// TODO: This seems flakey, need to think of a way around this.
			await driver.sleep( 1500 );
			await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.wp-checkout__review-order-step .checkout-button.is-status-primary:not(.is-busy)' )
			);
			await driverHelper.clickWhenClickable(
				driver,
				By.css( '.wp-checkout__review-order-step .checkout-button.is-status-primary:not(.is-busy)' )
			);
			const newCartAmount = await securePaymentComponent.cartTotalAmount();
			assert.notStrictEqual(
				originalCartAmount,
				newCartAmount,
				'The cart amounts are the same after changing plans'
			);
		} );
	} );

	describe( 'Can Add/Remove Coupons', async function () {
		step( 'Can Enter Coupon Code', async function () {
			const enterCouponCodeButton = await driverHelper.isElementPresent(
				driver,
				By.css( '.wp-checkout-order-review__show-coupon-field-button' )
			);
			// If the button doesn't exist lets check to see if a coupon has already been applied
			if ( enterCouponCodeButton ) {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
				const originalCartAmount = await securePaymentComponent.cartTotalAmount();
				await securePaymentComponent.enterCouponCode( dataHelper.getTestCouponCode() );
				const newCartAmount = await securePaymentComponent.cartTotalAmount();
				const expectedCartAmount =
					Math.round( ( originalCartAmount * 0.99 + Number.EPSILON ) * 100 ) / 100;

				assert.strictEqual( newCartAmount, expectedCartAmount, 'Coupon not applied properly' );
			} else {
				const existingCoupon = await driverHelper.isElementPresent(
					driver,
					By.css( '.checkout-line-item[data-product-type="coupon"]' )
				);
				assert.strictEqual(
					existingCoupon,
					true,
					'We cannot find the apply coupon button, and an existing coupon code is not applied. Something is wrong'
				);
			}
		} );

		step( 'Can Remove Coupon', async function () {
			await driver.switchTo().defaultContent();
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
			const originalCartAmount = await securePaymentComponent.cartTotalAmount();
			await securePaymentComponent.removeCoupon();
			const removedCouponAmount = await securePaymentComponent.cartTotalAmount();
			assert.notStrictEqual(
				removedCouponAmount,
				originalCartAmount,
				'Coupon not removed properly'
			);
		} );
	} );
} );
