/**
 * External dependencies
 */
import { By as by } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';
import AsyncBaseContainer from '../async-base-container';

export default class ThemePreviewPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.web-preview.is-visible .web-preview__content' ) );
		this.activateSelector = by.css( '.web-preview__toolbar-tray .is-primary' );
	}

	async _postInit() {
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			by.css( '.web-preview.is-visible .web-preview__content' )
		);
	}

	async activateButtonVisible() {
		return await driverHelper.isElementPresent( this.driver, this.activateSelector );
	}

	async activate() {
		return await driverHelper.clickWhenClickable( this.driver, this.activateSelector );
	}
}
