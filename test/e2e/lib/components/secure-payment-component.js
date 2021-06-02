/**
 * External dependencies
 */
import config from 'config';
import { By, promise } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';
import { currentScreenSize } from '../driver-manager';
import { getJetpackHost } from '../data-helper';

export default class SecurePaymentComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super(
			driver,
			By.css( '.checkout__secure-payment-form,.secure-payment-form,.composite-checkout' ),
			null,
			2 * config.get( 'explicitWaitMS' )
		);
		this.paymentButtonLocator = By.css( '.composite-checkout .checkout-submit-button button' );
		this.personalPlanSlug = getJetpackHost() === 'WPCOM' ? 'personal-bundle' : 'jetpack_personal';
		this.premiumPlanSlug = getJetpackHost() === 'WPCOM' ? 'value_bundle' : 'jetpack_premium';
		this.businessPlanSlug =
			getJetpackHost() === 'WPCOM' ? 'business-bundle' : 'jetpack_security_daily';
		this.dotLiveDomainSlug = 'dotlive_domain';
	}

	async isCompositeCheckout() {
		return await driverHelper.isElementLocated( this.driver, By.css( '.composite-checkout' ) );
	}

	async _postInit() {
		// This is to wait for products to settle down during sign up see - https://github.com/Automattic/wp-calypso/issues/24579
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			this.paymentButtonLocator,
			this.explicitWaitMS
		);
	}

	async setInElementsIframe( iframeSelector, what, value ) {
		await driverHelper.waitUntilAbleToSwitchToFrame( this.driver, By.css( iframeSelector ) );
		await driverHelper.setWhenSettable( this.driver, By.name( what ), value, {
			pauseBetweenKeysMS: 50,
		} );
		await this.driver.switchTo().defaultContent();
	}

	async enterTestCreditCardDetails( {
		cardHolder,
		cardNumber,
		cardExpiry,
		cardCVV,
		cardPostCode,
		cardCountryCode,
	} ) {
		// This PR introduced an issue with older browsers, specifically IE11:
		//   https://github.com/Automattic/wp-calypso/pull/22239
		const pauseBetweenKeysMS = 1;

		// In old checkout, the tax fields are part of the credit card payment
		// form, so we must fill them out here, but for new checkout, those fields
		// are part of the contact form and must be filled out explicitly before
		// calling this function by using
		// SecurePaymentComponent.completeTaxDetailsInContactSection.
		await this.completeTaxDetailsForCreditCard( { cardPostCode, cardCountryCode } );

		const creditCardHandleLocator = driverHelper.createTextLocator(
			By.css( 'label[for="card"]' ),
			'Credit or debit card'
		);
		await driverHelper.scrollIntoView( this.driver, creditCardHandleLocator );

		// Sometimes the credit card form will be closed and it will require a click to be opened.
		// This can happen when users have a credit card already associated with their account.
		await driverHelper.clickWhenClickable( this.driver, creditCardHandleLocator );

		await driverHelper.setWhenSettable(
			this.driver,
			By.css( '#name,#cardholder-name' ),
			cardHolder,
			{
				pauseBetweenKeysMS: pauseBetweenKeysMS,
			}
		);

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
	}

	async completeTaxDetailsForCreditCard( { cardPostCode, cardCountryCode } ) {
		// This PR introduced an issue with older browsers, specifically IE11:
		//   https://github.com/Automattic/wp-calypso/pull/22239
		const pauseBetweenKeysMS = 1;

		// In old checkout, we have separate postal code and country fields that
		// are part of the credit card form. In new checkout, these do not exist
		// (those fields are in the contact step) so we can skip this step.
		const isCompositeCheckout = await this.isCompositeCheckout();
		if ( isCompositeCheckout ) {
			return;
		}
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `div.country select option[value="${ cardCountryCode }"]` )
		);
		return await driverHelper.setWhenSettable( this.driver, By.id( 'postal-code' ), cardPostCode, {
			pauseBetweenKeysMS,
		} );
	}

	async completeTaxDetailsInContactSection( { cardPostCode, cardCountryCode } ) {
		// This PR introduced an issue with older browsers, specifically IE11:
		//   https://github.com/Automattic/wp-calypso/pull/22239
		const pauseBetweenKeysMS = 1;

		// In old checkout, contact details are only requested for domain products
		// (ignoring G Suite for the moment), so we do not need to fill them out in
		// this step, we just need to fill out the tax fields in the contact
		// section. If they need to be filled out for either checkout, see
		// CheckOutPage.enterRegistrarDetails.
		const isCompositeCheckout = await this.isCompositeCheckout();
		if ( ! isCompositeCheckout ) {
			return;
		}

		await driverHelper.setWhenSettable(
			this.driver,
			By.css( '#contact-postal-code' ),
			cardPostCode,
			{
				pauseBetweenKeysMS,
			}
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `#country-selector option[value="${ cardCountryCode }"]` )
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button[aria-label="Continue with the entered contact details"]' )
		);
	}

	async submitPaymentDetails() {
		const disabledPaymentButton = By.css(
			'.credit-card-payment-box button[disabled],.composite-checkout .checkout-submit-button button[disabled]'
		);

		await driverHelper.waitUntilElementNotLocated( this.driver, disabledPaymentButton );
		return await driverHelper.clickWhenClickable( this.driver, this.paymentButtonLocator );
	}

	async waitForCreditCardPaymentProcessing() {
		const isCompositeCheckout = await this.isCompositeCheckout();

		if ( isCompositeCheckout ) {
			return await driverHelper.waitUntilElementNotLocated(
				this.driver,
				By.css( '.checkout-submit-button .checkout-button.is-busy' ),
				this.explicitWaitMS * 5
			);
		}
		return await driverHelper.waitUntilElementNotLocated(
			this.driver,
			By.css( '.credit-card-payment-box__progress-bar' ),
			this.explicitWaitMS * 5
		);
	}

	async waitForPageToDisappear() {
		return await driverHelper.waitUntilElementNotLocated(
			this.driver,
			this.expectedElementLocator,
			this.explicitWaitMS * 5
		);
	}

	async getProductsNames() {
		const locator = By.css( '.product-name' );
		return await this.driver
			.findElements( locator )
			.then( ( products ) => promise.fullyResolved( products.map( ( e ) => e.getText() ) ) );
	}

	async numberOfProductsInCart() {
		const elements = await this.driver.findElements(
			By.css(
				'.product-name,.checkout-steps__step-complete-content .checkout-line-item:not([data-e2e-product-slug=""])'
			)
		);
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

	async containsPlan( planSlug ) {
		return await this._cartContainsProduct( planSlug );
	}

	async containsDotLiveDomain() {
		return await this._cartContainsProduct( this.dotLiveDomainSlug );
	}

	async payWithStoredCardIfPossible( cardCredentials ) {
		const storedCardLocator = By.css( '.credit-card__stored-card' );
		if (
			await driverHelper.isElementEventuallyLocatedAndVisible(
				this.driver,
				storedCardLocator,
				this.explicitWaitMS / 5
			)
		) {
			await driverHelper.clickWhenClickable( this.driver, storedCardLocator );
		} else {
			await this.completeTaxDetailsInContactSection( cardCredentials );
			await this.enterTestCreditCardDetails( cardCredentials );
		}

		try {
			await this.submitPaymentDetails();
		} catch {
			const noticeLocator = By.css(
				'.notice button.notice_dismiss, .notice button.notice__dismiss'
			);
			if ( await driverHelper.isElementLocated( this.driver, noticeLocator ) ) {
				await driverHelper.clickWhenClickable( this.driver, noticeLocator );
				await this.submitPaymentDetails();
			}
		}
	}

	async toggleCartSummary() {
		const isCompositeCheckout = await this.isCompositeCheckout();
		if ( isCompositeCheckout ) {
			return;
		}

		// Mobile
		if ( currentScreenSize() === 'mobile' ) {
			return await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.checkout__summary-toggle' )
			);
		}
	}

	async clickCouponButton() {
		const isCompositeCheckout = await this.isCompositeCheckout();
		if ( isCompositeCheckout ) {
			const selector =
				getJetpackHost() === 'WPCOM'
					? '.checkout-steps__step-complete-content .wp-checkout-order-review__show-coupon-field-button'
					: '.checkout-steps__step-content .wp-checkout-order-review__show-coupon-field-button';
			return await driverHelper.clickWhenClickable( this.driver, By.css( selector ) );
		}

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

	getCartTotalLocator() {
		if ( currentScreenSize() === 'mobile' ) {
			return By.css( '.cart__total-amount,.cart-total-amount,.wp-checkout__total-price' );
		}
		return By.css(
			'.cart__total-amount,.cart-total-amount,.wp-checkout-order-summary__total-price'
		);
	}

	async cartTotalAmount() {
		if ( currentScreenSize() === 'mobile' ) {
			await driverHelper.scrollIntoView( this.driver, this.getCartTotalLocator() );
		}
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, this.getCartTotalLocator() );

		const cartElement = await this.driver.findElement( this.getCartTotalLocator() );

		const cartText = await cartElement.getAttribute( 'innerText' );

		// We need to remove the comma separator first, e.g. 1,024 or 2,048, so `match()` can parse out the whole number properly.
		const amountMatches = cartText.replace( /,/g, '' ).match( /\d+\.?\d*/g );
		const amountString = amountMatches[ 0 ];
		return parseFloat( amountString );
	}

	async applyCoupon() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css(
				'button[data-e2e-type="apply-coupon"],.checkout-steps__step-content .coupon button,' +
					'.checkout-steps__step-complete-content .coupon button'
			)
		);
		return this.waitForCouponToBeApplied();
	}

	async enterCouponCode( couponCode ) {
		await this.clickCouponButton();
		await driverHelper.setWhenSettable(
			this.driver,
			By.css(
				'input[data-e2e-type="coupon-code"],.checkout-steps__step-content .coupon input,' +
					'.checkout-steps__step-complete-content .coupon input'
			),
			couponCode
		);
		return await this.applyCoupon();
	}

	async hasCouponApplied() {
		const isCompositeCheckout = await this.isCompositeCheckout();
		if ( isCompositeCheckout ) {
			return await driverHelper.isElementLocated(
				this.driver,
				By.css( '#checkout-line-item-coupon-line-item' )
			);
		}
		return await driverHelper.isElementLocated( this.driver, By.css( '.cart__remove-link' ) );
	}

	async waitForCouponToBeApplied() {
		const isCompositeCheckout = await this.isCompositeCheckout();
		if ( isCompositeCheckout ) {
			return await driverHelper.waitUntilElementLocatedAndVisible(
				this.driver,
				By.css( '.checkout-review-order.is-summary #checkout-line-item-coupon-line-item' )
			);
		}
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( '.cart__remove-link' )
		);
	}

	async waitForCouponToBeRemoved() {
		const isCompositeCheckout = await this.isCompositeCheckout();
		if ( isCompositeCheckout ) {
			await driverHelper.waitUntilElementNotLocated(
				this.driver,
				By.css( '[data-e2e-cart-is-loading="true"]' )
			);

			return await driverHelper.waitUntilElementNotLocated(
				this.driver,
				By.css( '#checkout-line-item-coupon-line-item' )
			);
		}
		return await driverHelper.waitUntilElementNotLocated(
			this.driver,
			By.css( '.cart__remove-link' )
		);
	}

	async removeCoupon() {
		const isCompositeCheckout = await this.isCompositeCheckout();

		if ( isCompositeCheckout ) {
			// Open review step for editing
			await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.wp-checkout__review-order-step .checkout-step__edit-button' )
			);

			// Click delete button on coupon line item
			await driverHelper.clickWhenClickable(
				this.driver,
				By.css(
					'.checkout-steps__step-content .checkout-line-item[data-product-type="coupon"] button'
				)
			);
			// Dismiss confirmation modal
			await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.checkout-modal .checkout-button.is-status-primary' )
			);
			// Make sure the coupon item is removed
			return this.waitForCouponToBeRemoved();
		}

		// Old checkout - desktop
		if ( currentScreenSize() !== 'mobile' ) {
			await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.cart-body .cart__remove-link' )
			);
			return this.waitForCouponToBeRemoved();
		}
		// Old checkout - mobile
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.payment-box__content .cart__remove-link' )
		);
		return this.waitForCouponToBeRemoved();
	}

	async removeBusinessPlan() {
		const trashButtonLocator = By.css(
			`.checkout-line-item[data-e2e-product-slug="${ this.businessPlanSlug }"] button.checkout-line-item__remove-product`
		);
		const confirmButtonLocator = driverHelper.createTextLocator(
			By.css( '.checkout-modal .checkout-button' ),
			'Continue'
		);

		await driverHelper.clickWhenClickable( this.driver, trashButtonLocator );
		await driverHelper.clickWhenClickable( this.driver, confirmButtonLocator );
	}

	async cartTotalDisplayed() {
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, this.getCartTotalLocator() );
		return await this.driver.findElement( this.getCartTotalLocator() ).getText();
	}

	async paymentButtonText() {
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, this.paymentButtonLocator );
		await driverHelper.scrollIntoView( this.driver, this.paymentButtonLocator );
		return await this.driver.findElement( this.paymentButtonLocator ).getText();
	}

	async _cartContainsProduct( productSlug, expectedQuantity = 1 ) {
		const orderSummary = await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( '.checkout-review-order.is-summary' )
		);
		const summaryItems = await orderSummary.findElements(
			By.css(
				`.product-name[data-e2e-product-slug="${ productSlug }"], .checkout-steps__step-complete-content .checkout-line-item[data-e2e-product-slug="${ productSlug }"]`
			)
		);
		return summaryItems.length === expectedQuantity;
	}
}
