/**
 * External dependencies
 */
import webdriver from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

import * as driverHelper from '../driver-helper.js';
import * as driverManager from '../driver-manager.js';

const by = webdriver.By;

export default class ProfilePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.me-profile-settings' ) );
	}

	async clickSignOut() {
		const signOutSelector = by.css( '.me-sidebar__signout-button,.sidebar__me-signout-button' );
		await this._closeProfileViewOnMobile();
		await driverHelper.clickWhenClickable( this.driver, signOutSelector );
		return driverHelper.waitTillNotPresent( this.driver, signOutSelector ).then(
			() => {},
			() => {
				// Occasionally the click doesn't work on mobile due to the drawer animation, so retry once
				driverHelper.clickWhenClickable( this.driver, signOutSelector );
				return driverHelper.waitTillNotPresent( this.driver, signOutSelector );
			}
		);
	}

	async chooseManagePurchases() {
		await this._closeProfileViewOnMobile();
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.sidebar a[href$="purchases"]' )
		);
	}

	async chooseAccountSettings() {
		await this._closeProfileViewOnMobile();
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.sidebar a[href$="account"]' )
		);
	}

	async _closeProfileViewOnMobile() {
		if ( driverManager.currentScreenSize() !== 'mobile' ) {
			return;
		}
		const displayed = await driverHelper.isElementPresent(
			this.driver,
			by.css( '.focus-content' )
		);
		if ( displayed ) {
			await this.driver.executeScript( 'window.scrollTo(0, 0);' );
			return await driverHelper.clickWhenClickable(
				this.driver,
				by.css( 'header.current-section button' )
			);
		}
	}
}
