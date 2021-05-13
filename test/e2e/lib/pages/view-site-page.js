/**
 * External dependencies
 */
import { By as by } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

import * as driverHelper from '../driver-helper.js';

export default class ViewSitePage extends AsyncBaseContainer {
	constructor( driver, url = null ) {
		super( driver, by.css( '.home' ), url );
	}

	async viewFirstPost() {
		return await driverHelper.clickWhenClickable( this.driver, by.css( '.entry-title a' ) );
	}

	async siteTitle() {
		return await this.driver.findElement( by.css( '.site-title' ) ).getText();
	}

	async siteTagline() {
		return await this.driver.findElement( by.css( '.site-description' ) ).getText();
	}
}
