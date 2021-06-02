/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';

export default class ProfilePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.profile__settings' ) );
	}

	async _preInit() {
		if ( this.screenSize === 'mobile' ) {
			// On mobile viewport, the sidebar is initially open and needs a bit to
			// finish the slide-in animation. This is important because only after the
			// animation is done, the sidebar items become fully interactable.
			this.expectedElementLocator = By.css( '.focus-sidebar.is-section-me' );
			await this.driver.sleep( 600 );
		}
	}

	async clickSignOut() {
		const buttonLocator = By.css( '.me-sidebar__signout-button,.sidebar__me-signout-button' );
		await driverHelper.clickWhenClickable( this.driver, buttonLocator );
		await driverHelper.waitUntilElementNotLocated( this.driver, buttonLocator );
	}

	async chooseManagePurchases() {
		const itemLocator = By.css( '.sidebar a[href$="purchases"]' );
		return await driverHelper.clickWhenClickable( this.driver, itemLocator );
	}

	async chooseAccountSettings() {
		const itemLocator = By.css( '.sidebar a[href$="account"]' );
		return await driverHelper.clickWhenClickable( this.driver, itemLocator );
	}
}
