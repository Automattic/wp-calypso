/**
 * External dependencies
 */
import { By as by, until } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';

import * as driverHelper from '../../driver-helper';

export default class AddEditProductPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.woocommerce .products__product-form-details' ) );
	}

	async enterTitle( productTitle ) {
		return await driverHelper.setWhenSettable( this.driver, by.css( 'input#name' ), productTitle );
	}

	async enterDescription( descriptionText ) {
		await this.driver.wait(
			until.ableToSwitchToFrame( by.css( '.mce-edit-area iframe' ) ),
			this.explicitWaitMS,
			'Could not locate the description editor iFrame.'
		);
		await this.driver.findElement( by.css( '#tinymce' ) ).sendKeys( descriptionText );
		return await this.driver.switchTo().defaultContent();
	}

	async addCategory( categoryName ) {
		return await driverHelper.setWhenSettable(
			this.driver,
			by.css( '.products__categories-card input.token-field__input' ),
			categoryName
		);
	}

	async setPrice( price ) {
		return await driverHelper.setWhenSettable(
			this.driver,
			by.css( '.products__product-form-price input[name="price"]' ),
			price
		);
	}

	async setDimensions( length, width, height ) {
		await driverHelper.setWhenSettable(
			this.driver,
			by.css( '.products__product-dimensions-input input[name="length"]' ),
			length
		);
		await driverHelper.setWhenSettable(
			this.driver,
			by.css( '.products__product-dimensions-input input[name="width"]' ),
			width
		);
		return await driverHelper.setWhenSettable(
			this.driver,
			by.css( '.products__product-dimensions-input input[name="height"]' ),
			height
		);
	}

	async setWeight( weight ) {
		return await driverHelper.setWhenSettable(
			this.driver,
			by.css( '.products__product-weight-input input[name="weight"]' ),
			weight
		);
	}

	async addQuantity( quantity ) {
		return await driverHelper.setWhenSettable(
			this.driver,
			by.css( '.products__product-manage-stock input[name="stock_quantity"]' ),
			quantity
		);
	}

	async allowBackorders() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'select[name="backorders"] option[value="yes"]' )
		);
	}

	async saveAndPublish() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.action-header__actions button.is-primary' )
		);
	}

	async deleteProduct() {
		const menuSelector = by.css( 'button.split-button__toggle' );
		if ( await driverHelper.isElementPresent( this.driver, menuSelector ) ) {
			// open the menu on mobile screens
			await driverHelper.clickWhenClickable( this.driver, menuSelector );
			await driverHelper.clickWhenClickable(
				this.driver,
				by.css( '.popover__menu-item.is-scary' )
			);
		} else {
			await driverHelper.clickWhenClickable(
				this.driver,
				by.css( '.action-header__actions button.is-scary' )
			);
		}
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.dialog__action-buttons button[data-e2e-button="accept"]' )
		);
	}
}
