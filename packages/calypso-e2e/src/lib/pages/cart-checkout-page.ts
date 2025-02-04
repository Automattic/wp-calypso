import { Frame, Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';
import envVariables from '../../env-variables';
import type { PaymentDetails, RegistrarDetails } from '../../types/data-helper.types';

const selectors = {
	// Modal
	modalContinueButton: '.checkout-modal__content button:text("Continue")',

	// Banner
	dismissBanner: `button[aria-label="Dismiss"]`,

	// Cart item
	cartItem: ( itemName: string ) =>
		`[data-testid="review-order-step--visible"] .checkout-line-item >> text=${ itemName.trim() }`,
	removeCartItemButton: ( itemName: string ) =>
		`[data-testid="review-order-step--visible"] button[aria-label*="Remove ${ itemName.trim() } from cart"]`,
	cartItems: `[data-testid="review-order-step--visible"] .checkout-line-item`,

	// Order Summary
	editOrderButton: 'button[aria-label="Edit your order"]',
	editPaymentStep: 'button[aria-label="Edit the payment method"]',
	removeCouponButton: ( coupon: string ) =>
		`button[aria-label="Remove Coupon: ${ coupon } from cart"]`,
	saveOrderButton: 'button[aria-label="Save your order"]',

	// Registrar information
	firstNameInput: `input[aria-describedby="validation-field-first-name"]`,
	lastNameInput: `input[aria-describedby="validation-field-last-name"]`,
	phoneInput: `input[name="phone"]`,
	phoneSelect: 'select.phone-input__country-select',
	countrySelect: 'select[aria-describedby="country-selector-description"]',
	addressInput: 'input[aria-describedby="validation-field-address-1"]',
	cityInput: 'input[aria-describedby="validation-field-city"]',
	stateSelect: 'select[aria-describedby="validation-field-state"]',
	postalCodeInput: 'input[aria-describedby="validation-field-postal-code"]',
	submitRegistrarInformationButton:
		'button[aria-label="Continue with the entered contact details"]',

	// Tax information
	countryCode: `select[aria-labelledby="country-selector-label"]`,
	postalCode: `input[id="contact-postal-code"]`,
	submitBillingInformationButton:
		'[data-testid="contact-form--visible"] button.checkout-button.is-status-primary',

	// Payment method cards
	existingCreditCard: ( cardHolderName: string ) =>
		`label[for*="existingCard"]:has-text("${ cardHolderName }")`,

	// Payment field
	cardholderName: `input[id="cardholder-name"]`,
	cardNumberFrame: 'iframe[title="Secure card number input frame"]',
	cardNumberInput: 'input[data-elements-stable-field-name="cardNumber"]',
	cardExpiryFrame: 'iframe[title="Secure expiration date input frame"]',
	cardExpiryInput: 'input[data-elements-stable-field-name="cardExpiry"]',
	cardCVVFrame: 'iframe[title="Secure CVC input frame"]',
	cardCVVInput: 'input[data-elements-stable-field-name="cardCvc"]',

	// Checkout elements
	couponCodeInputButton: `button:text("Have a coupon?"):visible`,
	couponCodeInput: `input[id="order-review-coupon"]`,
	couponCodeApplyButton: `button:text("Apply")`,
	disabledButton: 'button[disabled]:has-text("Processing")',
	paymentButton: `.checkout-submit-button button`,
	totalAmount:
		envVariables.VIEWPORT_NAME === 'mobile'
			? '.wp-checkout__total-price'
			: '.wp-checkout-order-summary__total-price',
	purchaseButton: `.checkout-submit-button button:has-text("Pay")`,
	thirdPartyDeveloperCheckboxLabel:
		'You agree that an account may be created on a third party developer’s site related to the products you have purchased.',

	// Cancel purchase
	closeLeaveButton: 'button:text("Leave items")',
	closeEmptyCartButton: 'button:text("Empty cart")',
};

/**
 * Page representing the Secure Checkout page.
 */
export class CartCheckoutPage {
	private page: Page;

	/**
	 * Constructs an instance of the Cart Checkout POM.
	 *
	 * @param {Page} page Instance of the Playwright page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Navigates to checkout page of the specified blog.
	 *
	 * @param {string} blogName Blogname for which checkout is to be loaded.
	 */
	async visit( blogName: string ): Promise< void > {
		await this.page.goto( getCalypsoURL( `checkout/${ blogName }` ), {
			waitUntil: 'networkidle',
			timeout: 20 * 1000,
		} );
	}

	/**
	 * Validates that the card payment input fields are visible.
	 */
	async validatePaymentForm(): Promise< void > {
		const cardholderNameLocator = this.page.locator( selectors.cardholderName );
		await cardholderNameLocator.waitFor( { state: 'visible', timeout: 20 * 1000 } );
	}
	/**
	 * Validates that an item is in the cart with the expected text. Throws if it isn't.
	 *
	 * @param {string} expectedCartItemName Expected text for the name of the item in the cart.
	 * @throws If the expected cart item is not found in the timeout period.
	 */
	async validateCartItem( expectedCartItemName: string ): Promise< void > {
		await this.page.waitForSelector( selectors.cartItem( expectedCartItemName ) );
	}

	/**
	 * Removes the specified cart item from the cart completely.
	 *
	 * @param {string} cartItemName Name of the item to remove from the cart.
	 */
	async removeCartItem( cartItemName: string ): Promise< void > {
		await this.page.click( selectors.removeCartItemButton( cartItemName ) );
		await this.page.click( selectors.modalContinueButton );
	}

	/**
	 * Validates that the cart contains the expected number of items.
	 */
	async validateCartItemsCount( totalItems: number ): Promise< void > {
		await this.page.waitForSelector( selectors.cartItems );
		const cartItemsLocator = this.page.locator( selectors.cartItems );
		const itemsCount = await cartItemsLocator.count();
		if ( itemsCount !== totalItems ) {
			throw new Error( `Expected ${ totalItems } items in cart, but found ${ itemsCount }` );
		}
	}

	/**
	 * Obtains the text content of the payment button.
	 *
	 * @returns {string} Content of the payment button.
	 */
	async getPaymentButtonText(): Promise< string > {
		const elementHandle = await this.page.waitForSelector( selectors.paymentButton );
		return await elementHandle.innerText();
	}

	/**
	 * Apply a given coupon.
	 *
	 * This method does not differentiate between valid and invalid coupons.
	 * The supplied coupon code is applied, and the resulting banner is dismissed.
	 *
	 * The calling method should verify whether the coupon code produced intended results.
	 *
	 * @param {string} coupon Coupon code.
	 */
	async enterCouponCode( coupon: string ): Promise< void > {
		await this.page.click( selectors.couponCodeInputButton );

		await this.page.fill( selectors.couponCodeInput, coupon );
		await this.page.click( selectors.couponCodeApplyButton );

		// Wait until coupon is fully applied to cart items to determine if the banner message
		// needs to be closed.
		await this.page.waitForSelector( selectors.disabledButton, { state: 'hidden' } );
		if ( await this.page.isVisible( selectors.dismissBanner ) ) {
			await this.page.click( selectors.dismissBanner );
		}
	}

	/**
	 * Removes a matching coupon from the cart.
	 *
	 * @param {string} coupon Coupon code to remove.
	 */
	async removeCouponCode( coupon: string ): Promise< void > {
		await this.page.click( selectors.editOrderButton );
		await this.page.click( selectors.removeCouponButton( coupon ) );
		await this.page.click( selectors.modalContinueButton );
		await this.page.click( selectors.saveOrderButton );

		// Similar to applying a coupon - wait until the cart is updated prior to continuing.
		await this.page.waitForSelector( selectors.disabledButton, { state: 'hidden' } );
		if ( await this.page.isVisible( selectors.dismissBanner ) ) {
			await this.page.click( selectors.dismissBanner );
		}
	}

	/**
	 * Returns the total amount of items in cart.
	 *
	 * Note, this only works with numering systems that use a comma for grouping separator
	 * and a full stop for decimals. Notably, Continental Europe uses the reverse notation
	 * and this method will produce an unexpected result.
	 *
	 * If optional parameter `rawString` is specified, the string as obtained is returned.
	 *
	 * @param param0 Object parameter.
	 * @param {boolean} param0.rawString If true, the string as displayed is returned.
	 * @returns {Promise<number|string>} Total value of items in cart.
	 */
	async getCheckoutTotalAmount( { rawString = false }: { rawString?: boolean } = {} ): Promise<
		number | string
	> {
		const totalAmountLocator = this.page.locator( selectors.totalAmount );
		await totalAmountLocator.waitFor( { timeout: 20 * 1000 } );

		const stringAmount = await totalAmountLocator.innerText();
		if ( rawString ) {
			// Returns the raw string.
			return stringAmount;
		}

		const parsedAmount = stringAmount.replace( /,/g, '' ).match( /\d+\.?\d*/g );
		if ( ! parsedAmount?.length ) {
			throw new Error( 'Unable to locate or parse cart amount.' );
		}
		return parseFloat( parsedAmount.pop() as string );
	}

	/**
	 * Enter domain registrar information.
	 *
	 * @param {RegistrarDetails} registrarDetails Domain registrar details.
	 */
	async enterDomainRegistrarDetails( registrarDetails: RegistrarDetails ): Promise< void > {
		await this.page.fill( selectors.firstNameInput, registrarDetails.firstName );
		await this.page.fill( selectors.lastNameInput, registrarDetails.lastName );
		await this.page.selectOption( selectors.phoneSelect, registrarDetails.countryCode );
		await this.page.fill( selectors.phoneInput, registrarDetails.phone );
		await this.page.selectOption( selectors.countrySelect, registrarDetails.countryCode );
		await this.page.fill( selectors.addressInput, registrarDetails.address );
		await this.page.fill( selectors.cityInput, registrarDetails.city );
		await this.page.selectOption( selectors.stateSelect, registrarDetails.stateCode );
		await this.page.fill( selectors.postalCodeInput, registrarDetails.postalCode );
		await this.page.click( selectors.submitRegistrarInformationButton );
	}

	/**
	 * Enter billing/tax details.
	 *
	 * @param {PaymentDetails} paymentDetails Object implementing the PaymentDetails interface.
	 */
	async enterBillingDetails( paymentDetails: PaymentDetails ): Promise< void > {
		await this.page.fill( selectors.postalCode, paymentDetails.postalCode );
		await this.page.selectOption( selectors.countryCode, paymentDetails.countryCode );
		await this.page.click( selectors.submitBillingInformationButton );
	}

	/**
	 * Selects a saved card payment method.
	 *
	 * @param {string} cardHolderName Name of the card holder associated with the payment method.
	 */
	async selectSavedCard( cardHolderName: string ): Promise< void > {
		// If the account has a saved card, the payment method step may
		// automatically collapse with the first saved card automatically
		// selected. So in order to select a different card, we need to click
		// the "Edit" button on the payment method step. There are cases where
		// the step will not be collapsed, however, so this will only trigger
		// if the edit button is visible.
		const cardSelector = this.page
			.locator( selectors.existingCreditCard( cardHolderName ) )
			.first();
		const editPaymentButton = this.page.locator( selectors.editPaymentStep );

		await cardSelector.or( editPaymentButton ).first().waitFor( { state: 'visible' } );

		if ( await editPaymentButton.isVisible() ) {
			await editPaymentButton.click();
		}

		await cardSelector.click();
	}

	/**
	 * Enter payment details.
	 *
	 * Note that this method will always choose to create
	 * a new card entry even if the intended payment
	 * details have already been saved.
	 *
	 * @param {PaymentDetails} paymentDetails Object implementing the PaymentDetails interface.
	 */
	async enterPaymentDetails( paymentDetails: PaymentDetails ): Promise< void > {
		// Click on the Credit or debit card input in order
		// to expand the fields.
		const cardInputLocator = this.page.locator( `span:has-text("Credit or debit card")` );
		await cardInputLocator.click();

		// Begin filling in the card details from
		// top to bottom.
		await this.page.fill( selectors.cardholderName, paymentDetails.cardHolder );

		const cardNumberFrameHandle = await this.page.waitForSelector( selectors.cardNumberFrame );
		const cardNumberFrame = ( await cardNumberFrameHandle.contentFrame() ) as Frame;
		const cardNumberInput = await cardNumberFrame.waitForSelector( selectors.cardNumberInput );
		await cardNumberInput.fill( paymentDetails.cardNumber );

		const expiryFrameHandle = await this.page.waitForSelector( selectors.cardExpiryFrame );
		const expiryFrame = ( await expiryFrameHandle.contentFrame() ) as Frame;
		const expiryInput = await expiryFrame.waitForSelector( selectors.cardExpiryInput );
		await expiryInput.fill( `${ paymentDetails.expiryMonth }${ paymentDetails.expiryYear }` );

		const cvvFrame = ( await (
			await this.page.waitForSelector( selectors.cardCVVFrame )
		).contentFrame() ) as Frame;
		const cvvInput = await cvvFrame.waitForSelector( selectors.cardCVVInput );
		await cvvInput.fill( paymentDetails.cvv );
	}

	/**
	 * Complete the purchase by clicking on the 'Pay' button.
	 */
	async purchase( { timeout }: { timeout?: number } = {} ): Promise< void > {
		await Promise.all( [
			this.page.waitForResponse( /.*me\/transactions.*/, { timeout: timeout } ),
			this.page.click( selectors.purchaseButton ),
		] );
	}

	/**
	 * Close checkout and leave/empty items from cart.
	 *
	 * @param {boolean} leaveItems Leave items in cart or not.
	 */
	async closeCheckout( leaveItems: boolean ): Promise< void > {
		await this.page.getByRole( 'button', { name: 'Close Checkout' } ).click();
		await Promise.all( [
			this.page.click( leaveItems ? selectors.closeLeaveButton : selectors.closeEmptyCartButton ),
		] );
	}
}
