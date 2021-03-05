/**
 * External dependencies
 */
import { By as by } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';

import AsyncBaseContainer from '../async-base-container.js';

export default class EditorConfirmationSidebarComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.editor-confirmation-sidebar.is-active' ) );
	}

	async confirmAndPublish() {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			by.css( '.editor-confirmation-sidebar__action button.button' )
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.editor-confirmation-sidebar__action button.button' )
		);
	}

	async publishDateShown() {
		const dateSelector = by.css(
			'.editor-confirmation-sidebar .editor-publish-date__header-chrono'
		);
		await driverHelper.waitTillPresentAndDisplayed( this.driver, dateSelector );
		return await this.driver.findElement( dateSelector ).getText();
	}
}
