/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';

import * as driverHelper from '../../driver-helper';

export default class SummaryPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.steps__main[data-e2e-type="summary"]' ) );
	}

	async selectVisitSite() {
		return await driverHelper.clickWhenClickable( this.driver, By.css( 'a.button.is-primary' ) );
	}

	async countToDoSteps() {
		await driverHelper.waitTillNotPresent( this.driver, By.css( 'div.spinner' ) );
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( 'div.jetpack-onboarding__summary-entry.completed' )
		);
		const toDos = await this.driver.findElements(
			By.css( 'div.jetpack-onboarding__summary-entry.todo svg' )
		);
		return toDos.length;
	}

	async visitStep( stepNumber ) {
		const steps = await this.driver.findElements(
			By.css( 'div.jetpack-onboarding__summary-entry' )
		);
		return await steps[ stepNumber - 1 ].click();
	}
}
