/**
 * External dependencies
 */
// import assert from 'assert';

/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

const selectors = {
	showCartButton: '.popover-cart',
	popOver: '.popover',
	cartItems: '.cart-item',
	moreItems: '.cart-items__expander',
};

/**
 * Component for the Upgrade Shopping Cart.
 *
 * @augments {BaseContainer}
 */
export class CartComponent extends BaseContainer {
	constructor( page: Page ) {
		super( page, selectors.showCartButton );
	}

	async viewCart(): Promise< void > {
		await this.page.click( selectors.showCartButton );
		const popOver = await this.page.waitForSelector( selectors.popOver );
		await popOver.waitForElementState( 'stable' );
	}

	async removeDomain( name: string ): Promise< void > {
		const expander = await this.page.$( selectors.moreItems );
		if ( expander ) {
			await expander.click();
		}

		const popOver = await this.page.waitForSelector( selectors.popOver );
		const items = await popOver.$$( selectors.cartItems );
		const numItems = items.length;

		for ( const item of items ) {
			const match = await item.$( `text=${ name }` );

			if ( match ) {
				console.log( 'match!' );
				const removeButton = await item.waitForSelector( '.cart__remove-item' );
				console.log( removeButton );

				await removeButton.click();
				await popOver.waitForElementState( 'stable' );
			}
		}

		if ( numItems === 1 ) {
			await this.page.waitForSelector( selectors.showCartButton, { state: 'hidden' } );
		}
	}
}
