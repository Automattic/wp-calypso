import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';

export default class ShoppingCartWidgetComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.masterbar-cart .masterbar__item' ) );

		this.cartButtonLocator = this.expectedElementLocator;
		this.cartPopoverLocator = By.css( '.masterbar-cart__content-wrapper' );
		this.cartCheckoutButtonLocator = By.css( '.masterbar-cart__checkout' );
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
	}

	async removeItem( self ) {
		const doCartItemsRemain = await driverHelper.isElementLocated(
			this.driver,
			this.cartButtonLocator
		);
		if ( doCartItemsRemain ) {
			return await driverHelper.clickWhenClickable(
				self.driver,
				By.css( '.checkout-line-item__remove-product' )
			);
		}
	}

	async empty() {
		const self = this;
		const cartBadgeLocator = By.css( '.masterbar-cart__count-container' );

		const present = await driverHelper.isElementLocated( self.driver, cartBadgeLocator );
		if ( present ) {
			await self.open();
			const numItems = await self.driver.findElement( cartBadgeLocator ).getText();
			for ( let i = 0; i < numItems; i++ ) {
				await self.removeItem( self );
			}
		}
	}
}
