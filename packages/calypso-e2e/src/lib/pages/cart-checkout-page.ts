import { Page } from 'playwright';

const selectors = {
	cartItem: '[data-testid="review-order-step--visible"] .checkout-line-item',
	modalContinueButton: 'button:text("Continue")',
};

/**
 * Page representing the cart checkout page for purchases made in Upgrades
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
	 * Validates the title of purchase that this purchase page is for.
	 *
	 * @param expectedCartItemName Expected text for the title of the purchase
	 */
	async validateCartItem( expectedCartItemName: string ): Promise< void > {
		await this.page.waitForSelector( `${ selectors.cartItem } >> text=${ expectedCartItemName }` );
	}

	/**
	 * Removes the specified cart item from the cart completely
	 *
	 * @param cartItemName Name of the item to remove from the cart
	 */
	async removeCartItem( cartItemName: string ): Promise< void > {
		await this.page.click(
			`[data-testid="review-order-step--visible"] button[aria-label*="Remove ${ cartItemName.trim() } from cart"]`
		);
		await this.page.click( selectors.modalContinueButton );
	}
}
