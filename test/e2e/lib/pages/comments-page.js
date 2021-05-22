/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

import * as driverHelper from '../driver-helper';

export default class CommentsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.comments' ) );
	}

	async waitForComments() {
		const driver = this.driver;
		const resultsLoadingLocator = By.css( '.comment .is-placeholder' );
		return await driverHelper.waitUntilElementNotLocated( driver, resultsLoadingLocator );
	}
}
