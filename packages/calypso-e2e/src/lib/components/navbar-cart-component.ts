import { Page } from 'playwright';

const selectors = {
	cartButton: '.masterbar-cart-button',
	popover: '.masterbar-cart-button__popover',
	removeItemButton: 'text=Remove from cart',
	removeDialogConfirmButton: '.masterbar-cart-button__popover button:text("Continue")',
	busyCheckoutButton: '.masterbar-cart-button__popover button:text("Checkout").is-busy',
};
/**
 * Component representing the navbar/masterbar at top of WPCOM.
 */
export class NavbarCartComponent {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Opens the popover cart.
	 */
	async openCart(): Promise< void > {
		await this.page.locator( selectors.cartButton ).waitFor( { state: 'visible', timeout: 3000 } );
		await this.page.locator( selectors.cartButton ).click();
		await this.page.locator( selectors.popover ).waitFor();
		// Sometimes there is background work happening when you open the popover. This can interrupt later actions taken.
		// Best indicator is that the Checkout button is no longer busy.
		await this.page.locator( selectors.busyCheckoutButton ).waitFor( { state: 'detached' } );
	}

	/**
	 * Removes an item from the cart.
	 *
	 * This method expects the cart popover to be open. Otherwise, this method will throw.
	 *
	 * @param param0 Parameter object.
	 * @param {number} param0.index 0-indexed value representing the cart item to remove.
	 */
	async removeCartItem( { index = 0 }: { index: number } ): Promise< void > {
		await this.page.locator( selectors.removeItemButton ).nth( index ).click();
		await this.page.locator( selectors.removeDialogConfirmButton ).click();
		// We have to wait for the removal to go through, or weird race conditions happen.
		// The safest indicator is that there is no longer a "busy"-state Checkout button.
		await this.page.locator( selectors.busyCheckoutButton ).waitFor( { state: 'detached' } );
	}

	/**
	 * Empties the cart.
	 *
	 * This method expects the cart popover to be open. Otherwise, this method will throw.
	 */
	async emptyCart(): Promise< void > {
		const numberOfCartItems = await this.page.locator( selectors.removeItemButton ).count();
		for ( let index = 0; index < numberOfCartItems; index++ ) {
			// Since we're going one by one and removing them all, we can always just remove the first item until there are none.
			await this.removeCartItem( { index: 0 } );
		}
	}

	/**
	 * Checks if the cart button is visible.
	 *
	 * @returns {Promise<boolean>} True if the cart button is visible, false otherwise.
	 */
	async isCartButtonVisible(): Promise< boolean > {
		return ( await this.page.locator( selectors.cartButton ).isVisible() ) ?? false;
	}
}
