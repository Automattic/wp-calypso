/** @format */

import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../../async-base-container';
import * as DriverHelper from '../../driver-helper.js';

export default class ImporterPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.settings-import__section-description' ) );
	}

	async importerIsDisplayed( importerClass ) {
		return DriverHelper.isElementPresent(
			this.driver,
			By.css( `.importer__shell .${ importerClass }` )
		);
	}
}
