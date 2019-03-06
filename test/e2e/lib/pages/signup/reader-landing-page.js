/** @format */

import { By } from 'selenium-webdriver';

import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper.js';

export default class ReaderLandingPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.is-reader-landing' ) );
	}

	async clickStartUsingTheReader() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.reader-landing__button' )
		);
	}
}
