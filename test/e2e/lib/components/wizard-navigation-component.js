/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container.js';

import * as driverHelper from '../driver-helper.js';

export default class WizardNavigationComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.wizard__navigation-links' ) );
	}

	async _postInit() {
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( 'a.wizard__navigation-link' ),
			this.explicitWaitMS
		);
	}

	async goBack() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a.wizard__navigation-link .gridicons-arrow-left' )
		);
	}

	async skipStep( stepNumber ) {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( `.wizard__progress-indicator[data-e2e-type="step-indicator-${ stepNumber }"]` )
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a.wizard__navigation-link .gridicons-arrow-right' )
		);
	}
}
