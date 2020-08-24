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
		const resultsLoadingSelector = By.css( '.comment .is-placeholder' );
		return await driver.wait(
			function () {
				return driverHelper
					.isElementPresent( driver, resultsLoadingSelector )
					.then( function ( present ) {
						return ! present;
					} );
			},
			this.explicitWaitMS,
			'The comments placeholder element was still present when it should have disappeared by now.'
		);
	}
}
