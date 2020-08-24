/* eslint-disable jsdoc/check-tag-names */
/** @format */

const webdriver = require( 'selenium-webdriver' );

const AsyncBaseContainer = require( '../async-base-container' );

const driverHelper = require( '../driver-helper.js' );

const by = webdriver.By;

class ProfilePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.sidebar__region' ) );
	}

	async clickSignOut() {
		const signOutSelector = by.css( 'button.sidebar__me-signout-button' );
		await this.driver.sleep( 1000 );
		await driverHelper.clickWhenClickable( this.driver, signOutSelector );
		return await this.driver.sleep( 1000 );
	}
}

module.exports = ProfilePage;
