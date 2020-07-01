/* eslint-disable jsdoc/check-tag-names */
/** @format */

const driverHelper = require( './driver-helper' );

class AsyncBaseContainer {
	constructor( driver, expectedElementSelector, waitMS = 30000 ) {
		this.name = this.constructor.name;
		this.driver = driver;
		this.expectedElementSelector = expectedElementSelector;
		this.explicitWaitMS = waitMS;
	}

	static async Expect( driver ) {
		const page = new this( driver );
		await page._expectInit();
		return page;
	}

	async _expectInit() {
		await this.waitForPage();
		await this.checkForConsoleErrors();
	}

	async waitForPage() {
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			this.expectedElementSelector,
			this.explicitWaitMS
		);
	}

	async displayed() {
		return await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			this.expectedElementSelector,
			this.explicitWaitMS
		);
	}

	async title() {
		return await this.driver.getTitle();
	}

	async checkForConsoleErrors() {
		return await driverHelper.checkForConsoleErrors( this.driver );
	}
}

module.exports = AsyncBaseContainer;
