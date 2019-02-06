/** @format */

import webdriver, { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper';
import { currentScreenSize } from '../driver-manager';

const by = webdriver.By;

export default class PlanCheckoutPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.checkout__payment-box-container' ) );
		this.cartTotalSelector = By.css( '.cart__total-amount,.cart-total-amount' );
	}

	async clickCouponButton() {
		// If we're on desktop
		if ( currentScreenSize() === 'desktop' ) {
			return await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.cart__coupon button.cart__toggle-link' )
			);
		}

		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.payment-box__content .cart__coupon button.cart__toggle-link' )
		);
	}

	async toggleCartSummary() {
		// Mobile
		if ( currentScreenSize() === 'mobile' ) {
			return await driverHelper.clickWhenClickable(
				this.driver,
				by.css( '.checkout__summary-toggle' )
			);
		}
	}

	async cartTotalAmount() {
		let cartElement = await this.driver.findElement( this.cartTotalSelector );

		if ( currentScreenSize() === 'mobile' ) {
			await driverHelper.scrollIntoView( this.driver, this.cartTotalSelector );
		}

		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.cartTotalSelector );
		let cartText = await cartElement.getText();
		let amountMatches = cartText.match( /\d+\.?\d*/g );
		return await parseFloat( amountMatches[ 0 ] );
	}

	async applyCoupon() {
		await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'button[data-e2e-type="apply-coupon"]' )
		);
		return await driverHelper.clickWhenClickable( this.driver, By.css( '.notice__dismiss' ) );
	}

	async enterCouponCode( couponCode ) {
		await this.clickCouponButton();
		await driverHelper.setWhenSettable(
			this.driver,
			by.css( 'input[data-e2e-type="coupon-code"]' ),
			couponCode
		);
		return await this.applyCoupon();
	}

	async hasCouponApplied() {
		return await driverHelper.isElementPresent( this.driver, By.css( '.cart__remove-link' ) );
	}

	async removeCoupon() {
		// Desktop
		if ( currentScreenSize() === 'desktop' ) {
			return await driverHelper.clickWhenClickable( this.driver, By.css( '.cart__remove-link' ) );
		}

		// Mobile
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.payment-box__content .cart__remove-link' )
		);
	}

	async removeFromCart() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'button.cart__remove-item' )
		);
	}
}
