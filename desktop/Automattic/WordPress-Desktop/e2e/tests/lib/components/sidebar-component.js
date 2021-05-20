/* eslint-disable jsdoc/check-tag-names */
/** @format */

const webdriver = require( 'selenium-webdriver' );
const driverHelper = require( '../driver-helper.js' );

const AsyncBaseContainer = require( '../async-base-container' );
const By = webdriver.By;

class SidebarComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.sidebar' ) );
	}

	async selectMyHome() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.menu-link-text[data-e2e-sidebar="My Home"]' )
		);
	}
}

module.exports = SidebarComponent;
