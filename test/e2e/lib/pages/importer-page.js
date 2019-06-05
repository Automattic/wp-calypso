/** @format */

/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as DriverHelper from '../driver-helper.js';

export default class ImporterPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.importer__section-header' ) );
	}

	async importerIsDisplayed( importerClass ) {
		return await DriverHelper.isElementPresent(
			this.driver,
			By.css( `.importer__shell .${ importerClass }` )
		);
	}
}
