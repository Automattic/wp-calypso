/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';

import * as driverHelper from '../../driver-helper';

export default class ActivateStatsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.steps__main[data-e2e-type="stats"]' ) );
	}

	async selectActivateStats() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a.card[data-e2e-type="activate-stats"] button' )
		);
	}

	async selectContinue() {
		const continueSelector = By.css( 'a.card[data-e2e-type="continue"] button' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, continueSelector );
		return await driverHelper.clickWhenClickable( this.driver, continueSelector );
	}
}
