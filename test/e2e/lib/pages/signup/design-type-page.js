/** @format */

import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';

import AsyncBaseContainer from '../../async-base-container';

export default class DesignTypePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.design-type-with-store__list' ) );
	}

	async selectFirstDesignType() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.design-type-with-store__list .card:nth-of-type(1) .button' ),
			this.explicitWaitMS
		);
	}
}
