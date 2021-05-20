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
	}

	async open() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.popover-cart .header-button' ),
			this.explicitWaitMS
		);
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

	async removeDomainRegistraion( domain ) {
		return this.remove( 'domain_reg', domain );
	}

	async removeDomainMapping( domain ) {
		return this.remove( 'domain_map', domain );
	}

	async remove( type, name ) {
		const cartBadgeLocator = By.css( '.cart__count-badge' );

		const present = await driverHelper.isElementLocated( this.driver, cartBadgeLocator );
		if ( present ) {
			await this.open();
			await driverHelper.clickWhenClickable(
				this.driver,
				By.xpath(
					// Find an element X with class=.cart-item
					//    that contains an element with data-e2e-product-slug=`type`
					//    and a sibling with class="product-domain" and text=`name`
					// and then select an element inside X that matches class=cart__remove-item
					`//*[@class="cart-item"][.//*[@data-e2e-product-slug="${ type }"]/following-sibling::*[@class="product-domain"][text()="${ name }"]]//*[@class="cart__remove-item"]`
				)
			);
		}
	}
}
