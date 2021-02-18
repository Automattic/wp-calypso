/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper.js';

import AsyncBaseContainer from '../../async-base-container';

export default class ChooseAThemePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.themes-list' ) );
	}

	async selectFirstTheme() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a.theme__thumbnail img' ),
			this.explicitWaitMS
		);
	}
}
