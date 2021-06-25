/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';
import AsyncBaseContainer from '../async-base-container';

export default class PluginsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.plugins-browser-list' ) );
	}

	async viewPlugin( pluginSlug ) {
		const pluginLocator = By.css( `a.plugin-item__link[href*='${ pluginSlug }']` );
		return await driverHelper.clickWhenClickable( this.driver, pluginLocator );
	}
}
