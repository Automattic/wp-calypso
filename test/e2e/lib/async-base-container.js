/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverManager from './driver-manager';
import * as driverHelper from './driver-helper';
import * as overrideABTests from './override-abtest';

export default class AsyncBaseContainer {
	constructor(
		driver,
		expectedElementSelector,
		url = null,
		waitMS = config.get( 'explicitWaitMS' )
	) {
		this.name = this.constructor.name;
		this.driver = driver;
		this.screenSize = driverManager.currentScreenSize().toUpperCase();
		this.expectedElementSelector = expectedElementSelector;
		this.url = url;
		this.explicitWaitMS = waitMS;
		this.visiting = false;
	}

	static async Expect( driver ) {
		const page = new this( driver );
		await page._expectInit();
		return page;
	}

	static async Visit( driver, url ) {
		const page = new this( driver, url );
		if ( ! page.url ) {
			throw new Error( `URL is required to visit the ${ page.name }` );
		}
		page.visiting = true;
		await page._visitInit();
		return page;
	}

	async _visitInit() {
		await this.driver.get( this.url );
		return await this._expectInit();
	}

	async _expectInit() {
		if ( global.__JNSite === true ) {
			await driverHelper.refreshIfJNError( this.driver );
		}
		if ( typeof this._preInit === 'function' ) {
			await this._preInit();
		}
		await this.waitForPage();
		await this.checkForUnknownABTestKeys();
		await this.checkForConsoleErrors();
		if ( typeof this._postInit === 'function' ) {
			await this._postInit();
		}
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

	async urlDisplayed() {
		return await this.driver.getCurrentUrl();
	}

	async checkForConsoleErrors() {
		return await driverHelper.checkForConsoleErrors( this.driver );
	}

	async checkForUnknownABTestKeys() {
		return await overrideABTests.checkForUnknownABTestKeys( this.driver );
	}

	async setABTestControlGroupsInLocalStorage() {
		await overrideABTests.setABTestControlGroups( this.driver );
		return await this.waitForPage();
	}

	async overrideABTestInLocalStorage( name, variation ) {
		await overrideABTests.setOverriddenABTests( this.driver, name, variation );
		await this.waitForPage();
		return await this.driver.navigate().refresh();
	}
}
