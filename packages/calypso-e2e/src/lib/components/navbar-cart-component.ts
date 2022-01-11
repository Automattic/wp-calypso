import { Page } from 'playwright';

const selectors = {
	cartButton: 'masterbar-cart-button',
	popover: '.popover',
	removeItemButton: 'text=Remove from cart',
	removeDialogConfirmButton: 'text=Continue',
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
	 * Returns whether the cart is visible.
	 *
	 * If the popover cart is visible, there are at least one item(s) in the
	 * cart pending a checkout.
	 *
	 * @returns {Promise<boolean>} True if the cart is visible. False otherwise.
	 */
	private async cartVisible(): Promise< boolean > {
		await this.page.waitForLoadState( 'load' );
		return await this.page.isVisible( selectors.cartButton );
	}

	/**
	 * Opens the popover cart.
	 */
	async openCart(): Promise< boolean > {
		if ( await this.cartVisible() ) {
			await this.page.click( selectors.cartButton );
			const elementHandle = await this.page.waitForSelector( selectors.popover );
			await elementHandle.waitForElementState( 'stable' );
			return true;
		}
		return false;
	}

	/**
	 * Removes an item from the cart.
	 *
	 * This method expects the cart popover to be open. Otherwise, this method will throw.
	 *
	 * @param param0 Parameter object.
	 * @param {number} param0.index 1-indexed value representing the cart item to remove.
	 */
	async removeCartItem( { index = 1 }: { index: number } ): Promise< void > {
		await this.page.click( `:nth-match( ${ selectors.removeItemButton }, ${ index })` );
		await this.page.click( selectors.removeDialogConfirmButton );
	}

	/**
	 * Empties the cart.
	 *
	 * This method expects the cart popover to be open. Otherwise, this method will throw.
	 */
	async emptyCart(): Promise< void > {
		const items = await this.page.$$( selectors.removeItemButton );
		items.forEach( async ( _, index ) => {
			await this.removeCartItem( { index: index + 1 } );
		} );
	}
}
