/** @format */

import { By } from 'selenium-webdriver';

import AsyncBaseContainer from '../../async-base-container';

import * as driverHelper from '../../driver-helper';

export default class ViewBlogPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, By.css( '.content-area' ), url );
		this.trampolineSelector = By.css( '#trampoline #trampoline-text' );
	}

	async waitForTrampolineWelcomeMessage() {
		return await driverHelper.waitTillPresentAndDisplayed( this.driver, this.trampolineSelector );
	}

	async isTrampolineWelcomeDisplayed() {
		return await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			this.trampolineSelector
		);
	}
}
