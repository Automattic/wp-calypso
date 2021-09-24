import { Page } from 'playwright';

const selectors = {
	// Cart popover
	cartButton: '.popover-cart button',
	popOver: '.popover',
	removeItemButton: 'button[aria-label="Remove item"]',
	popOverCartPlaceholder: '.cart-item__loading-placeholder',

	searchForDomainButton: `a:text-matches("(s|S)earch", "i")`,
};

/**
 * Page representing the Upgrades > Domains page.
 */
export class DomainsPage {
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
	 * Clicks on the button to add a domain to the site.
	 */
	async addDomain(): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.searchForDomainButton ),
		] );
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
			const elementHandle = await this.page.waitForSelector( selectors.popOver );
			await elementHandle.waitForElementState( 'stable' );
			return true;
		}
		return false;
	}

	/**
	 * Removes item(s) from the cart.
	 *
	 * This method can behave in one of two ways:
	 * 	- if `index` is provided, the cart item at `index` will be removed.
	 * 	- if `all` is true, all cart items are removed.
	 *
	 * By default, the `all` flag is false and the caller is expected to provide
	 * an index value.
	 *
	 * @param param0 Parameter object.
	 * @param {number} param0.index 1-indexed value.
	 * @param {boolean} param0.all If true, all items in cart will be removed. Defaults to false.
	 */
	async removeCartItem( {
		index = 1,
		all = false,
	}: { index?: number; all?: boolean } = {} ): Promise< void > {
		if ( all ) {
			const items = await this.page.$$( selectors.removeItemButton );
			for await ( const item of items ) {
				await item.click();
				await this.page.waitForSelector( selectors.popOverCartPlaceholder, { state: 'hidden' } );
			}
		} else {
			await this.page.click( `:nth-match( ${ selectors.removeItemButton }, ${ index })` );
		}
	}
}
