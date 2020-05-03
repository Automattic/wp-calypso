/**
 * External dependencies
 */
import webdriver from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';
import AsyncBaseContainer from '../async-base-container';

const by = webdriver.By;

export default class PluginsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.plugins-browser-list' ) );
	}

	async viewPlugin( pluginSlug ) {
		const pluginSelector = by.css( `a.plugin-item__link[href*='${ pluginSlug }']` );
		return await driverHelper.clickWhenClickable( this.driver, pluginSelector );
	}
}
