/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper';
import * as driverManager from '../driver-manager';
import AsyncBaseContainer from '../async-base-container';

export default class StoreSidebarComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.store-sidebar__sidebar' ) );
		this.productsLinkLocator = By.css( 'li.products a' );
		this.ordersLinkLocator = By.css( 'li.orders a' );
		this.settingsLinkLocator = By.css( 'li.settings a' );
	}

	async _postInit() {
		return await this.displayComponentIfNecessary();
	}

	// this is necessary on mobile width screens
	async displayComponentIfNecessary() {
		const mobileLeftArrowLocator = By.css( '.action-header button' );
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			const mobileLeftArrowElement = await this.driver.findElement( mobileLeftArrowLocator );
			const displayed = await mobileLeftArrowElement.isDisplayed();
			if ( displayed === true ) {
				return await driverHelper.clickWhenClickable( this.driver, mobileLeftArrowLocator );
			}
		}
	}

	productsLinkDisplayed() {
		return driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			this.productsLinkLocator
		);
	}

	ordersLinkDisplayed() {
		return driverHelper.isElementEventuallyLocatedAndVisible( this.driver, this.ordersLinkLocator );
	}

	selectProducts() {
		return driverHelper.clickWhenClickable( this.driver, this.productsLinkLocator );
	}

	selectOrders() {
		return driverHelper.clickWhenClickable( this.driver, this.ordersLinkLocator );
	}

	addProduct() {
		this.selectProducts();
		return driverHelper.selectElementByText( this.driver, By.css( '.button' ), 'Add a product' );
	}

	settingsLinkDisplayed() {
		return driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			this.settingsLinkLocator
		);
	}

	selectSettings() {
		return driverHelper.clickWhenClickable( this.driver, this.settingsLinkLocator );
	}
}
