/**
 * External dependencies
 */
import { By, Key } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';

import AsyncBaseContainer from '../async-base-container.js';

export default class GuideComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.components-guide' ) );
	}

	async dismiss( waitOverride, selector = '.components-guide' ) {
		if (
			await driverHelper.isElementEventuallyLocatedAndVisible(
				this.driver,
				By.css( '.components-guide__container' ),
				waitOverride
			)
		) {
			try {
				// Easiest way to dismiss it, but it might not work in IE.
				await this.driver.findElement( By.css( selector ) ).sendKeys( Key.ESCAPE );
			} catch {
				// Click to the last page of the welcome guide.
				await driverHelper.clickWhenClickable(
					this.driver,
					By.css( 'ul.components-guide__page-control li:last-child button' )
				);
				// Click the finish button.
				await driverHelper.clickWhenClickable(
					this.driver,
					By.css( '.components-guide__finish-button' )
				);
			}
		}
	}
}
