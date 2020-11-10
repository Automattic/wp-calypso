/**
 * External dependencies
 */
import config from 'config';
import { By, promise, until } from 'selenium-webdriver';

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
			By.css( '.checkout__secure-payment-form,.secure-payment-form,.composite-checkout' ),
			null,
			2 * config.get( 'explicitWaitMS' )
		);
		this.paymentButtonSelector = By.css(
			'.credit-card-payment-box button.is-primary:not([disabled]),.composite-checkout .checkout-submit-button button'
		);
		this.personalPlanSlug = getJetpackHost() === 'WPCOM' ? 'personal-bundle' : 'jetpack_personal';
		this.premiumPlanSlug = getJetpackHost() === 'WPCOM' ? 'value_bundle' : 'jetpack_premium';
		this.businessPlanSlug =
			getJetpackHost() === 'WPCOM' ? 'business-bundle' : 'jetpack_security_daily';
		this.dotLiveDomainSlug = 'dotlive_domain';
	}

	async isCompositeCheckout() {
		return driverHelper.isElementPresent( this.driver, By.css( '.composite-checkout' ) );
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

		const creditCardHandleSelector = By.css( 'label[for="card"]' );
		await driverHelper.scrollIntoView( this.driver, creditCardHandleSelector );

		// Sometimes the credit card form will be closed and it will require a click to be opened.
		// This can happen when users have a credit card already associated with their account.
		await driverHelper.selectElementByText(
			this.driver,
			creditCardHandleSelector,
			'Credit or debit card'
		);

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
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button[aria-label="Continue with the entered contact details"]' )
		);
	}

	async submitPaymentDetails() {
		const disabledPaymentButton = By.css(
			'.credit-card-payment-box button[disabled],.composite-checkout .checkout-submit-button button[disabled]'
		);

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
		const storedCardSelector = By.css( '.credit-card__stored-card' );
		if (
			await driverHelper.isEventuallyPresentAndDisplayed(
				this.driver,
				storedCardSelector,
				this.explicitWaitMS / 5
			)
		) {
			await driverHelper.clickWhenClickable( this.driver, storedCardSelector );
		} else {
			await this.completeTaxDetailsInContactSection( cardCredentials );
			await this.enterTestCreditCardDetails( cardCredentials );
		}

		return await this.submitPaymentDetails();
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
			return await driverHelper.clickWhenClickable(
				this.driver,
				By.css(
					'.checkout-steps__step-complete-content .wp-checkout-order-review__show-coupon-field-button'
				)
			);
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

	getCartTotalSelector() {
		if ( currentScreenSize() === 'mobile' ) {
			return By.css( '.cart__total-amount,.cart-total-amount,.wp-checkout__total-price' );
		}
		return By.css(
			'.cart__total-amount,.cart-total-amount,.wp-checkout-order-summary__total-price'
		);
	}

	async cartTotalAmount() {
		if ( currentScreenSize() === 'mobile' ) {
			await driverHelper.scrollIntoView( this.driver, this.getCartTotalSelector() );
		}
		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.getCartTotalSelector() );

		const cartElement = await this.driver.findElement( this.getCartTotalSelector() );

		const cartText = await cartElement.getText();

		// We need to remove the comma separator first, e.g. 1,024 or 2,048, so `match()` can parse out the whole number properly.
		const amountMatches = cartText.replace( /,/g, '' ).match( /\d+\.?\d*/g );
		const amountString = amountMatches[ 0 ];
		return parseFloat( amountString );
	}

	async applyCoupon() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css(
				'button[data-e2e-type="apply-coupon"],.checkout-steps__step-complete-content .coupon button'
			)
		);
		const noticesComponent = await NoticesComponent.Expect( this.driver );
		await noticesComponent.dismissNotice();
		return this.waitForCouponToBeApplied();
	}

	async enterCouponCode( couponCode ) {
		await this.clickCouponButton();
		await driverHelper.setWhenSettable(
			this.driver,
			By.css(
				'input[data-e2e-type="coupon-code"],.checkout-steps__step-complete-content .coupon input'
			),
			couponCode
		);
		return await this.applyCoupon();
	}

	async hasCouponApplied() {
		const isCompositeCheckout = await this.isCompositeCheckout();
		if ( isCompositeCheckout ) {
			return driverHelper.isElementPresent(
				this.driver,
				By.css( '#checkout-line-item-coupon-line-item' )
			);
		}
		return driverHelper.isElementPresent( this.driver, By.css( '.cart__remove-link' ) );
	}

	async waitForCouponToBeApplied() {
		const isCompositeCheckout = await this.isCompositeCheckout();
		if ( isCompositeCheckout ) {
			return driverHelper.waitTillPresentAndDisplayed(
				this.driver,
				By.css( '#checkout-line-item-coupon-line-item' )
			);
		}
		return driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.cart__remove-link' ) );
	}

	async waitForCouponToBeRemoved() {
		const isCompositeCheckout = await this.isCompositeCheckout();
		if ( isCompositeCheckout ) {
			await driverHelper.waitTillNotPresent(
				this.driver,
				By.css( '[data-e2e-cart-is-loading="true"]' )
			);

			return await driverHelper.waitTillNotPresent(
				this.driver,
				By.css( '#checkout-line-item-coupon-line-item' )
			);
		}
		return await driverHelper.waitTillNotPresent( this.driver, By.css( '.cart__remove-link' ) );
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
		const productSlug = this.businessPlanSlug;
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css(
				`button.cart__remove-item,.checkout-line-item[data-e2e-product-slug="${ productSlug }"] button.checkout-line-item__remove-product`
			)
		);
	}

	async cartTotalDisplayed() {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.getCartTotalSelector() );
		return await this.driver.findElement( this.getCartTotalSelector() ).getText();
	}

	async paymentButtonText() {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.paymentButtonSelector );
		await driverHelper.scrollIntoView( this.driver, this.paymentButtonSelector );
		return await this.driver.findElement( this.paymentButtonSelector ).getText();
	}

	async _cartContainsProduct( productSlug, expectedQuantity = 1 ) {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.product-name,.checkout-line-item' )
		);
		const elements = await this.driver.findElements(
			By.css(
				`.product-name[data-e2e-product-slug="${ productSlug }"],.checkout-steps__step-complete-content .checkout-line-item[data-e2e-product-slug="${ productSlug }"]`
			)
		);
		return elements.length === expectedQuantity;
	}
}
