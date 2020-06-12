/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper.js';
import AsyncBaseContainer from '../../async-base-container';

export default class PlansPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.plans' ) );
	}

	async hasSelectedPlan() {
		return await driverHelper.isElementPresent(
			this.driver,
			By.css( '.plan-item__select-button.is-selected' )
		);
	}
}
