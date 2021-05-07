/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';

import * as driverHelper from '../../driver-helper';

export default class ViewBlogPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, By.css( '.content-area' ), url );
		this.trampolineLocator = By.css( '#trampoline #trampoline-text' );
	}

	async waitForTrampolineWelcomeMessage() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			this.trampolineLocator
		);
	}

	async isTrampolineWelcomeDisplayed() {
		return await driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			this.trampolineLocator
		);
	}
}
