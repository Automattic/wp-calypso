/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';

import * as driverHelper from '../../driver-helper.js';

export default class WPAdminInPlacePlansPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.plans-prompt' ) );
	}

	async selectFreePlan() {
		// During signup, we used to no longer display the Free plan, so we have to click the "Skip" button
		const skipButtonLocator = By.css( '.plans-prompt__footer a' );
		return await driverHelper.clickWhenClickable( this.driver, skipButtonLocator );
	}
}
