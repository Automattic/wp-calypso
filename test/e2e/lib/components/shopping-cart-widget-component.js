/** @format */

import { By as by } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';

import AsyncBaseContainer from '../async-base-container';

export default class ShoppingCartWidgetComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.cart-toggle-button' ) );
	}

	async open() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.cart-toggle-button' ),
			this.explicitWaitMS
		);
	}

	async removeItem( self ) {
		let cartEmpty = await driverHelper.isElementPresent( this.driver, by.css( '.cart-empty' ) );
		if ( ! cartEmpty ) {
			return await driverHelper.clickWhenClickable( self.driver, by.css( '.cart__remove-item' ) );
		}
	}

	async empty() {
		let self = this;
		const cartBadgeSelector = by.css( '.cart__count-badge' );

		let present = await driverHelper.isElementPresent( self.driver, cartBadgeSelector );
		if ( present ) {
			await self.open();
			let numItems = await self.driver.findElement( cartBadgeSelector ).getText();
			for ( let i = 0; i < numItems; i++ ) {
				await self.removeItem( self );
			}
		}
	}
}
