/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';

export default class ImporterPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.importer__section-header' ) );
	}

	async importerIsDisplayed( importerClass ) {
		return await driverHelper.isElementLocated(
			this.driver,
			By.css( `.importer__file-importer-card .${ importerClass }` )
		);
	}
}
