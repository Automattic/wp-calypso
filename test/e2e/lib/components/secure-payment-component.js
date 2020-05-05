/**
 * External dependencies
 */
import { By, promise, until } from 'selenium-webdriver';
import config from 'config';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';
import { currentScreenSize } from '../driver-manager';
import { getJetpackHost } from '../data-helper';
import NoticesComponent from './notices-component';

export default class SecurePaymentComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super(
			driver,
			By.css( '.checkout__secure-payment-form,.secure-payment-form' ),
			null,
			2 * config.get( 'explicitWaitMS' )
		);
		this.paymentButtonSelector = By.css(
			'.credit-card-payment-box button.is-primary:not([disabled])'
		);
		this.personalPlanSlug = getJetpackHost() === 'WPCOM' ? 'personal-bundle' : 'jetpack_personal';
		this.premiumPlanSlug = getJetpackHost() === 'WPCOM' ? 'value_bundle' : 'jetpack_premium';
		this.businessPlanSlug = getJetpackHost() === 'WPCOM' ? 'business-bundle' : 'jetpack_business';
		this.dotLiveDomainSlug = 'dotlive_domain';
		this.cartTotalSelector = By.css( '.cart__total-amount,.cart-total-amount' );
	}

	async _postInit() {
		// This is to wait for products to settle down during sign up see - https://github.com/Automattic/wp-calypso/issues/24579
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			this.paymentButtonSelector,
			this.explicitWaitMS
		);
	}

	async setInElementsIframe( iframeSelector, what, value ) {
		await this.driver.wait(
			until.ableToSwitchToFrame( By.css( iframeSelector ) ),
			this.explicitWaitMS,
			'Could not locate the ElementInput iFrame.'
		);

		await driverHelper.setWhenSettable( this.driver, By.name( what ), value, {
			pauseBetweenKeysMS: 50,
		} );

		return await this.driver.switchTo().defaultContent();
	}

	async enterTestCreditCardDetails( {
		cardHolder,
		cardNumber,
		cardExpiry,
		cardCVV,
		cardCountryCode,
		cardPostCode,
	} ) {
		// This PR introduced an issue with older browsers, specifically IE11:
		//   https://github.com/Automattic/wp-calypso/pull/22239
		const pauseBetweenKeysMS = 1;

		await driverHelper.setWhenSettable( this.driver, By.id( 'name' ), cardHolder, {
			pauseBetweenKeysMS: pauseBetweenKeysMS,
		} );

		await this.setInElementsIframe(
			'.credit-card-form-fields .number iframe',
			'cardnumber',
			cardNumber
		);
		await this.setInElementsIframe( '.credit-card-form-fields .cvv iframe', 'cvc', cardCVV );
		await this.setInElementsIframe(
			'.credit-card-form-fields .expiration-date iframe',
			'exp-date',
			cardExpiry
		);

		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `div.country select option[value="${ cardCountryCode }"]` )
		);
		return await driverHelper.setWhenSettable( this.driver, By.id( 'postal-code' ), cardPostCode, {
			pauseBetweenKeysMS: pauseBetweenKeysMS,
		} );
	}

	async submitPaymentDetails() {
		const disabledPaymentButton = By.css( '.credit-card-payment-box button[disabled]' );

		await driverHelper.waitTillNotPresent( this.driver, disabledPaymentButton );
		return await driverHelper.clickWhenClickable( this.driver, this.paymentButtonSelector );
	}

	async waitForCreditCardPaymentProcessing() {
		return await driverHelper.waitTillNotPresent(
			this.driver,
			By.css( '.credit-card-payment-box__progress-bar' ),
			this.explicitWaitMS * 5
		);
	}

	async waitForPageToDisappear() {
		return await driverHelper.waitTillNotPresent(
			this.driver,
			this.expectedElementSelector,
			this.explicitWaitMS * 5
		);
	}

	async getProductsNames() {
		const selector = By.css( '.product-name' );
		return await this.driver
			.findElements( selector )
			.then( ( products ) => promise.fullyResolved( products.map( ( e ) => e.getText() ) ) );
	}

	async numberOfProductsInCart() {
		const elements = await this.driver.findElements( By.css( '.product-name' ) );
		return elements.length;
	}

	async containsPersonalPlan() {
		return await this._cartContainsProduct( this.personalPlanSlug );
	}

	async containsPremiumPlan() {
		return await this._cartContainsProduct( this.premiumPlanSlug );
	}

	async containsBusinessPlan() {
		return await this._cartContainsProduct( this.businessPlanSlug );
	}

	async containsDotLiveDomain() {
		return await this._cartContainsProduct( this.dotLiveDomainSlug );
	}

	async payWithStoredCardIfPossible( cardCredentials ) {
		const storedCardSelector = By.css( '.credit-card__stored-card' );
		if ( await driverHelper.isEventuallyPresentAndDisplayed( this.driver, storedCardSelector ) ) {
			await driverHelper.clickWhenClickable( this.driver, storedCardSelector );
		} else {
			await this.enterTestCreditCardDetails( cardCredentials );
		}

		return await this.submitPaymentDetails();
	}

	async toggleCartSummary() {
		// Mobile
		if ( currentScreenSize() === 'mobile' ) {
			return await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.checkout__summary-toggle' )
			);
		}
	}

	async clickCouponButton() {
		// If we're on desktop
		if ( currentScreenSize() !== 'mobile' ) {
			return await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.cart-body .cart__coupon button.cart__toggle-link' )
			);
		}

		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.payment-box__content .cart__coupon button.cart__toggle-link' )
		);
	}

	async cartTotalAmount() {
		const cartElement = await this.driver.findElement( this.cartTotalSelector );

		if ( currentScreenSize() === 'mobile' ) {
			await driverHelper.scrollIntoView( this.driver, this.cartTotalSelector );
		}

		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.cartTotalSelector );
		const cartText = await cartElement.getText();

		// We need to remove the comma separator first, e.g. 1,024 or 2,048, so `match()` can parse out the whole number properly.
		const amountMatches = cartText.replace( /,/g, '' ).match( /\d+\.?\d*/g );
		return await parseFloat( amountMatches[ 0 ] );
	}

	async applyCoupon() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button[data-e2e-type="apply-coupon"]' )
		);
		const noticesComponent = await NoticesComponent.Expect( this.driver );
		await noticesComponent.dismissNotice();
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.cart__remove-link' )
		);
	}

	async enterCouponCode( couponCode ) {
		await this.clickCouponButton();
		await driverHelper.setWhenSettable(
			this.driver,
			By.css( 'input[data-e2e-type="coupon-code"]' ),
			couponCode
		);
		return await this.applyCoupon();
	}

	async hasCouponApplied() {
		return await driverHelper.isElementPresent( this.driver, By.css( '.cart__remove-link' ) );
	}

	async removeCoupon() {
		// Desktop
		if ( currentScreenSize() !== 'mobile' ) {
			await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.cart-body .cart__remove-link' )
			);
			return await driverHelper.waitTillNotPresent( this.driver, By.css( '.cart__remove-link' ) );
		}

		// Mobile
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.payment-box__content .cart__remove-link' )
		);
		return await driverHelper.waitTillNotPresent( this.driver, By.css( '.cart__remove-link' ) );
	}
	async removeFromCart() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button.cart__remove-item' )
		);
	}

	async cartTotalDisplayed() {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.cartTotalSelector );
		return await this.driver.findElement( this.cartTotalSelector ).getText();
	}

	async paymentButtonText() {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.paymentButtonSelector );
		await driverHelper.scrollIntoView( this.driver, this.paymentButtonSelector );
		return await this.driver.findElement( this.paymentButtonSelector ).getText();
	}

	async _cartContainsProduct( productSlug, expectedQuantity = 1 ) {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.product-name' ) );
		const elements = await this.driver.findElements(
			By.css( `.product-name[data-e2e-product-slug="${ productSlug }"]` )
		);
		return elements.length === expectedQuantity;
	}
}
