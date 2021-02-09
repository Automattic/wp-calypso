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
		this.productsLinkSelector = By.css( 'li.products a' );
		this.ordersLinkSelector = By.css( 'li.orders a' );
		this.settingsLinkSelector = By.css( 'li.settings a' );
		this.promotionsLinkSelector = By.css( 'li.promotions a' );
		this.reviewsLinkSelector = By.css( 'li.reviews a' );
	}

	async _postInit() {
		return await this.displayComponentIfNecessary();
	}

	// this is necessary on mobile width screens
	async displayComponentIfNecessary() {
		const mobileLeftArrowSelector = By.css( '.action-header button' );
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			const mobileLeftArrowElement = await this.driver.findElement( mobileLeftArrowSelector );
			const displayed = await mobileLeftArrowElement.isDisplayed();
			if ( displayed === true ) {
				return await driverHelper.clickWhenClickable( this.driver, mobileLeftArrowSelector );
			}
		}
	}

	productsLinkDisplayed() {
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, this.productsLinkSelector );
	}

	ordersLinkDisplayed() {
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, this.ordersLinkSelector );
	}

	settingsLinkDisplayed() {
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, this.settingsLinkSelector );
	}

	promotionsLinkDisplayed() {
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, this.promotionsLinkSelector );
	}

	reviewsLinkDisplayed() {
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, this.reviewsLinkSelector );
	}

	async productsLinksToWoocommerce() {
		return await driverHelper.elementContainsLinkTo(
			this.driver,
			this.productsLinkSelector,
			/:\/\/.*\/wp-admin\/edit.php\?post_type=product/
		);
	}

	async ordersLinksToWoocommerce() {
		return await driverHelper.elementContainsLinkTo(
			this.driver,
			this.ordersLinkSelector,
			/:\/\/.*\/wp-admin\/edit.php\?post_type=shop_order/
		);
	}

	async settingsLinksToWoocommerce() {
		return await driverHelper.elementContainsLinkTo(
			this.driver,
			this.settingsLinkSelector,
			/:\/\/.*\/wp-admin\/admin.php\?page=wc-settings/
		);
	}

	async promotionsLinksToWoocommerce() {
		return await driverHelper.elementContainsLinkTo(
			this.driver,
			this.promotionsLinkSelector,
			/:\/\/.*\/wp-admin\/edit.php\?post_type=shop_coupon/
		);
	}

	async reviewsLinksToWoocommerce() {
		return await driverHelper.elementContainsLinkTo(
			this.driver,
			this.reviewsLinkSelector,
			/:\/\/.*\/wp-admin\/edit-comments.php/
		);
	}
}
