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
			By.css( '.plugins-browser__main-header .search' )
		);
		return await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.plugins-browser__main-header input[type="search"]' ),
			searchTerm,
			{ pauseBetweenKeysMS: 100 }
		);
	}

	async pluginTitledShown( pluginTitle, searchTerm ) {
		const selector = By.xpath(
			`//div[@class='plugins-browser-item__title' and text()='${ pluginTitle }']`
		);
		const shown = await driverHelper.isEventuallyPresentAndDisplayed( this.driver, selector );
		if ( shown === true ) {
			return shown;
		}
		SlackNotifier.warn(
			'The Jetpack Plugins Browser results were not showing the expected result, so trying again'
		);
		await driverHelper.clickWhenClickable( this.driver, By.css( '.search__close-icon' ) );
		await this.searchForPlugin( searchTerm );
		return await driverHelper.isEventuallyPresentAndDisplayed( this.driver, selector );
	}

	async selectManagePlugins() {
		const manageButtonSelector = By.css( ".plugins-browser__main a[href*='manage']" );
		return await driverHelper.clickWhenClickable( this.driver, manageButtonSelector );
	}
}
