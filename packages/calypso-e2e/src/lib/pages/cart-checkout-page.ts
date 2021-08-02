import { Page } from 'playwright';

const selectors = {
	modalContinueButton: 'button:text("Continue")',
	cartItem: ( itemName: string ) =>
		`[data-testid="review-order-step--visible"] .checkout-line-item >> text=${ itemName.trim() }`,
	removeCartItemButton: ( itemName: string ) =>
		`[data-testid="review-order-step--visible"] button[aria-label*="Remove ${ itemName.trim() } from cart"]`,
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
}
