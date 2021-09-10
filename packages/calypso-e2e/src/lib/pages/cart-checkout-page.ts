import { Frame, Page } from 'playwright';
import { DataHelper } from '../..';

const selectors = {
	// Modal
	modalContinueButton: '.checkout-modal__content button:text("Continue")',

	// Cart item
	cartItem: ( itemName: string ) =>
		`[data-testid="review-order-step--visible"] .checkout-line-item >> text=${ itemName.trim() }`,
	removeCartItemButton: ( itemName: string ) =>
		`[data-testid="review-order-step--visible"] button[aria-label*="Remove ${ itemName.trim() } from cart"]`,

	// Tax information
	countryCode: `select[aria-labelledby="country-selector-label"]`,
	postalCode: `input[id="contact-postal-code"]`,
	submitBillingInformationButton: `button[aria-label="Continue with the entered contact details"]`,

	// Payment field
	cardholderName: `input[id="cardholder-name"]`,
	cardNumberFrame: 'iframe[title="Secure card number input frame"]',
	cardNumberInput: 'input[data-elements-stable-field-name="cardNumber"]',
	cardExpiryFrame: 'iframe[title="Secure expiration date input frame"]',
	cardCVVFrame: 'iframe[title="Secure CVC input frame"]',

	// Checkout elements
	couponCodeInputButton: `button:text("Add a coupon code"):visible`,
	couponCodeInput: `input[id="order-review-coupon"]`,
	couponCodeApplyButton: `button:text("Apply")`,
	couponAppliedBanner: `span:text("Coupon discount applied to cart.")`,
	paymentButton: `button.checkout-button`,
	totalAmount: `.wp-checkout-order-summary__total-price`,
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
	 * @param {Page} page Instance of the Playwright page
	 */
	constructor( page: Page ) {
		this.page = page;
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
	 * Apply a coupon.
	 *
	 * If a coupon code is supplied as parameter, this method will apply the supplied code.
	 * Otherwise, this method will apply the default coupon code found in the configuration.
	 *
	 * @param {string} coupon Custom coupon code.
	 */
	async enterCouponCode( coupon?: string ): Promise< void > {
		await this.page.click( selectors.couponCodeInputButton );

		const couponCode =
			coupon !== undefined ? coupon : ( DataHelper.config.get( 'testCouponCode' ) as string );

		await this.page.fill( selectors.couponCodeInput, couponCode );
		await this.page.click( selectors.couponCodeApplyButton );
		await this.page.waitForSelector( selectors.couponAppliedBanner );
	}

	/**
	 * Returns the total amount of items in cart.
	 *
	 * @returns {string} Total value of items in cart.
	 */
	async getCheckoutTotalAmount(): Promise< number > {
		const elementHandle = await this.page.waitForSelector( selectors.totalAmount );
		const stringAmount = await elementHandle.innerText();
		const parsedAmount = stringAmount.replace( /,/g, '' ).match( /\d+\.?\d*/g );
		if ( ! parsedAmount?.length ) {
			throw new Error( 'Unable to locate or parse cart amount.' );
		}
		return parseInt( parsedAmount.pop() as string );
	}

	/**
	 *
	 * @param details
	 * @param details.postalCode
	 * @param details.country
	 */
	async enterBillingDetails( {
		postalCode,
		country,
	}: {
		[ key: string ]: string;
	} ): Promise< void > {
		await this.page.fill( selectors.postalCode, postalCode );
		await this.page.selectOption( selectors.countryCode, country );
		await this.page.click( selectors.submitBillingInformationButton );
	}

	/**
	 *
	 * @param details
	 */
	async enterPaymentDetails( {
		cardholder,
		number,
		expiryMonth,
		expiryYear,
		cvv,
	}: {
		[ key: string ]: string;
	} ): Promise< void > {
		await this.page.fill( selectors.cardholderName, cardholder );

		const frameHandle = await this.page.waitForSelector( selectors.cardNumberFrame );
		const cardNumberFrame = ( await frameHandle.contentFrame() ) as Frame;

		const cardNumberInput = await cardNumberFrame.waitForSelector( selectors.cardNumberInput );
		await cardNumberInput.fill( number );

		const expiryFrame = await this.page.waitForSelector( selectors.cardExpiryFrame );
		await expiryFrame.fill( `${ expiryMonth }${ expiryYear }` );

		const cvvFrame = await this.page.waitForSelector( selectors.cardCVVFrame );
		await cvvFrame.fill( cvv );
	}

	/**
	 *
	 */
	async purchase(): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.purchaseButton ),
		] );
	}
}
