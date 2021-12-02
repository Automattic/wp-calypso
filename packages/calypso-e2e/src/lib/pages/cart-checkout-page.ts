import { Frame, Page } from 'playwright';
import { getTargetDeviceName } from '../../browser-helper';
import type { PaymentDetails, RegistrarDetails } from '../../data-helper';
import type { TargetDevice } from '../../types';

const selectors = {
	// Modal
	modalContinueButton: '.checkout-modal__content button:text("Continue")',

	// Banner
	dismissBanner: `button[aria-label="Dismiss"]`,

	// Loading
	cartLoading: ( state: boolean ) => `div[data-e2e-cart-is-loading="${ state }"]`,

	// Cart item
	cartItem: ( itemName: string ) =>
		`[data-testid="review-order-step--visible"] .checkout-line-item >> text=${ itemName.trim() }`,
	removeCartItemButton: ( itemName: string ) =>
		`[data-testid="review-order-step--visible"] button[aria-label*="Remove ${ itemName.trim() } from cart"]`,

	// Order Summary
	editOrderButton: 'button[aria-label="Edit your order"]',
	removeCouponButton: ( coupon: string ) =>
		`button[aria-label="Remove Coupon: ${ coupon } from cart"]`,
	saveOrderButton: 'button[aria-label="Save your order"]',

	// Registrar information
	firstNameInput: `input[aria-describedby="validation-field-first-name"]`,
	lastNameInput: `input[aria-describedby="validation-field-last-name"]`,
	phoneInput: `input[name="phone"]`,
	phoneSelect: 'select.phone-input__country-select',
	countrySelect: 'select[aria-describedby="validation-field-country-code"]',
	addressInput: 'input[aria-describedby="validation-field-address-1"]',
	cityInput: 'input[aria-describedby="validation-field-city"]',
	stateSelect: 'select[aria-describedby="validation-field-state"]',
	postalCodeInput: 'input[aria-describedby="validation-field-postal-code"]',
	submitRegistrarInformationButton:
		'button[aria-label="Continue with the entered contact details"]',

	// Tax information
	countryCode: `select[aria-labelledby="country-selector-label"]`,
	postalCode: `input[id="contact-postal-code"]`,
	submitBillingInformationButton: `button[aria-label="Continue with the entered contact details"]`,

	// Payment field
	cardholderName: `input[id="cardholder-name"]`,
	cardNumberFrame: 'iframe[title="Secure card number input frame"]',
	cardNumberInput: 'input[data-elements-stable-field-name="cardNumber"]',
	cardExpiryFrame: 'iframe[title="Secure expiration date input frame"]',
	cardExpiryInput: 'input[data-elements-stable-field-name="cardExpiry"]',
	cardCVVFrame: 'iframe[title="Secure CVC input frame"]',
	cardCVVInput: 'input[data-elements-stable-field-name="cardCvc"]',

	// Checkout elements
	couponCodeInputButton: `button:text("Add a coupon code"):visible`,
	couponCodeInput: `input[id="order-review-coupon"]`,
	couponCodeApplyButton: `button:text("Apply")`,
	disabledButton: 'button[disabled]:has-text("Processing")',
	paymentButton: `button.checkout-button`,
	totalAmount: ( device: TargetDevice ) =>
		device === 'mobile' ? '.wp-checkout__total-price' : '.wp-checkout-order-summary__total-price',
	purchaseButton: `button.checkout-button:has-text("Pay")`,
};

/**
 * Page representing the cart checkout page for purchases made in Upgrades.
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
	 * Waits until the cart is fully loaded.
	 *
	 * By fully loaded, this implies:
	 * 	- network requests have been completed.
	 * 	- cart total is fully rendered to the user.
	 */
	private async waitUntilCartLoaded(): Promise< void > {
		await Promise.all( [
			this.page.waitForLoadState( 'networkidle' ),
			this.page.waitForSelector( selectors.cartLoading( false ) ),
		] );
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
		await this.waitUntilCartLoaded();
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
	 * @param {boolean} param0.rawString If true, the raw string is returned.
	 * @returns {Promise<number|string>} Total value of items in cart.
	 */
	async getCheckoutTotalAmount( { rawString = false }: { rawString?: boolean } = {} ): Promise<
		number | string
	> {
		await this.waitUntilCartLoaded();

		const elementHandle = await this.page.waitForSelector(
			selectors.totalAmount( getTargetDeviceName() )
		);
		const stringAmount = await elementHandle.innerText();
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
	 * Enter payment details.
	 *
	 * @param {PaymentDetails} paymentDetails Object implementing the PaymentDetails interface.
	 */
	async enterPaymentDetails( paymentDetails: PaymentDetails ): Promise< void > {
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
			this.page.waitForNavigation( { timeout: timeout } ),
			this.page.click( selectors.purchaseButton ),
		] );
	}
}
