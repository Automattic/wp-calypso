/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';
import AsyncBaseContainer from '../async-base-container';

export default class ThemePreviewPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.web-preview.is-visible .web-preview__content' ) );
		this.activateLocator = By.css( '.web-preview__toolbar-tray .is-primary' );
	}

	async _postInit() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( '.web-preview.is-visible .web-preview__content' )
		);
	}

	async activateButtonVisible() {
		return await driverHelper.isElementLocated( this.driver, this.activateLocator );
	}

	async activate() {
		return await driverHelper.clickWhenClickable( this.driver, this.activateLocator );
	}
}
