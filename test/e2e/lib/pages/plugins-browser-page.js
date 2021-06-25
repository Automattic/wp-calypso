/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as SlackNotifier from '../slack-notifier';
import * as driverHelper from '../driver-helper';

export default class PluginsBrowserPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.plugins-browser__main-header' ) );
	}

	async searchForPlugin( searchTerm ) {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.plugins-browser__main-header .search-component__icon-navigation' )
		);
		return await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.plugins-browser__main-header input[type="search"]' ),
			searchTerm,
			{ pauseBetweenKeysMS: 100 }
		);
	}

	async pluginTitledShown( pluginTitle, searchTerm ) {
		const locator = driverHelper.createTextLocator(
			By.css( '.plugins-browser-item__title' ),
			pluginTitle
		);
		const shown = await driverHelper.isElementEventuallyLocatedAndVisible( this.driver, locator );
		if ( shown === true ) {
			return shown;
		}
		SlackNotifier.warn(
			'The Jetpack Plugins Browser results were not showing the expected result, so trying again'
		);
		await driverHelper.clickWhenClickable( this.driver, By.css( '.search__close-icon' ) );
		await this.searchForPlugin( searchTerm );
		return await driverHelper.isElementEventuallyLocatedAndVisible( this.driver, locator );
	}

	async selectManagePlugins() {
		const manageButtonLocator = By.css( ".plugins-browser__main-buttons a[href*='manage']" );
		return await driverHelper.clickWhenClickable( this.driver, manageButtonLocator );
	}
}
