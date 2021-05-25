/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';

import AsyncBaseContainer from '../async-base-container';

export default class ShoppingCartWidgetComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.popover-cart .header-button' ) );

		this.cartButtonLocator = this.expectedElementLocator;
		this.cartPopoverLocator = By.css( '.popover-cart__popover' );
		this.cartExpandButtonLocator = By.css( '.popover-cart__popover .cart-items__expander' );
		this.cartCheckoutButtonLocator = By.css( '.popover-cart__popover .cart-checkout-button' );
		this.cartLoadingPlaceholderLocator = By.css( '.cart-body__loading-placeholder' );
	}

	async open() {
		const isOpen = await driverHelper.isElementLocated( this.driver, this.cartPopoverLocator );
		if ( isOpen ) {
			return;
		}

		await driverHelper.clickWhenClickable(
			this.driver,
			this.expectedElementLocator,
			this.explicitWaitMS
		);

		// Ensure it is open and interactive before returning
		await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			this.cartCheckoutButtonLocator
		);

		await this.expand();
	}

	async expand() {
		await driverHelper.clickIfPresent( this.driver, this.cartExpandButtonLocator );
	}

	async close() {
		const isClosed = await driverHelper.isElementNotLocated( this.driver, this.cartPopoverLocator );
		if ( isClosed ) {
			return;
		}

		await driverHelper.clickWhenClickable( this.driver, this.expectedElementLocator );
		await driverHelper.waitUntilElementNotLocated( this.driver, this.cartPopoverLocator );
	}

	async removeItem( self ) {
		const cartEmpty = await driverHelper.isElementLocated( this.driver, By.css( '.cart-empty' ) );
		if ( ! cartEmpty ) {
			return await driverHelper.clickWhenClickable( self.driver, By.css( '.cart__remove-item' ) );
		}
	}

	async empty() {
		const self = this;
		const cartBadgeLocator = By.css( '.cart__count-badge' );

		const present = await driverHelper.isElementLocated( self.driver, cartBadgeLocator );
		if ( present ) {
			await self.open();
			const numItems = await self.driver.findElement( cartBadgeLocator ).getText();
			for ( let i = 0; i < numItems; i++ ) {
				await self.removeItem( self );
			}
		}
	}

	async removeDomainRegistration( domain ) {
		return this.remove( 'domain_reg', domain );
	}

	async remove( type, name ) {
		const itemLocator = By.xpath(
			// Find an element X with class=.cart-item that contains an element with
			// data-e2e-product-slug=`type` and a sibling with class="product-domain" and text=`name` and
			// then select an element inside X that matches class=cart__remove-item
			`//*[@class="cart-item"][.//*[@data-e2e-product-slug="${ type }"]/following-sibling::*[@class="product-domain"][text()="${ name }"]]//*[@class="cart__remove-item"]`
		);

		await this.open();
		await driverHelper.clickWhenClickable( this.driver, itemLocator );
		await driverHelper.waitUntilElementNotLocated(
			this.driver,
			this.cartLoadingPlaceholderLocator
		);
		await this.close();
	}
}
