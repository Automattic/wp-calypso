/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverManager from './driver-manager';
import * as driverHelper from './driver-helper';

export default class AsyncBaseContainer {
	constructor(
		driver,
		expectedElementLocator,
		url = null,
		waitMS = config.get( 'explicitWaitMS' )
	) {
		this.name = this.constructor.name;
		this.driver = driver;
		this.screenSize = driverManager.currentScreenSize();
		this.expectedElementLocator = expectedElementLocator;
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
		if ( typeof this._postInit === 'function' ) {
			await this._postInit();
		}
	}

	async waitForPage() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			this.expectedElementLocator,
			this.explicitWaitMS
		);
	}

	async displayed() {
		return await driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			this.expectedElementLocator,
			this.explicitWaitMS
		);
	}

	async title() {
		return await this.driver.getTitle();
	}

	async urlDisplayed() {
		return await this.driver.getCurrentUrl();
	}
}
