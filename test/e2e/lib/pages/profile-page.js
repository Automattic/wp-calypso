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
		if ( this.screenSize === 'MOBILE' ) {
			// On mobile viewport, the sidebar is initially open and needs a bit to
			// finish the slide-in animation. This is important because only after the
			// animation is done, the sidebar items become fully interactable.
			this.expectedElementSelector = By.css( '.focus-sidebar.is-section-me' );
			await this.driver.sleep( 600 );
		}
	}

	async clickSignOut() {
		const buttonLocator = By.css( '.me-sidebar__signout-button,.sidebar__me-signout-button' );
		await driverHelper.clickWhenClickable( this.driver, buttonLocator );
		await driverHelper.waitTillNotPresent( this.driver, buttonLocator );
	}

	chooseManagePurchases() {
		const itemLocator = By.css( '.sidebar a[href$="purchases"]' );
		return driverHelper.clickWhenClickable( this.driver, itemLocator );
	}

	chooseAccountSettings() {
		const itemLocator = By.css( '.sidebar a[href$="account"]' );
		return driverHelper.clickWhenClickable( this.driver, itemLocator );
	}
}
