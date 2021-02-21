/* eslint-disable jsdoc/check-tag-names */
/** @format */

const { By } = require( 'selenium-webdriver' );
const AsyncBaseContainer = require( '../async-base-container' );
const driverHelper = require( '../driver-helper' );

class ChecklistPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.checklist' ) );
	}

	async isChecklistPresent() {
		return await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			By.css( '.checklist__tasks' ),
			20000
		);
	}
}

module.exports = ChecklistPage;
