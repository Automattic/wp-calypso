const webdriver = require( 'selenium-webdriver' );
const AsyncBaseContainer = require( '../async-base-container' );
const driverHelper = require( '../driver-helper.js' );

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
