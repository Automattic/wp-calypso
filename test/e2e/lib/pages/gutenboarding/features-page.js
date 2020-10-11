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
		super( driver, By.css( '.features' ) );
	}

	async skipStep() {
		const skipButtonSelector = By.css( '.action-buttons__skip' );
		return await driverHelper.clickWhenClickable( this.driver, skipButtonSelector );
	}
}
