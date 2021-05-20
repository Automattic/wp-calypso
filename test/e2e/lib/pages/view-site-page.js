/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

import * as driverHelper from '../driver-helper.js';

export default class ViewSitePage extends AsyncBaseContainer {
	constructor( driver, url = null ) {
		super( driver, By.css( '.home' ), url );
	}

	async viewFirstPost() {
		return await driverHelper.clickWhenClickable( this.driver, By.css( '.entry-title a' ) );
	}

	async siteTitle() {
		return await this.driver.findElement( By.css( '.site-title' ) ).getText();
	}

	async siteTagline() {
		return await this.driver.findElement( By.css( '.site-description' ) ).getText();
	}
}
