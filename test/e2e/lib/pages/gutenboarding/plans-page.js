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
	async expandAllPlans() {
		const toggleAllPlansSelector = By.css( 'button.plans-accordion__toggle-all-button' );
		return await driverHelper.clickWhenClickable( this.driver, toggleAllPlansSelector );
	}

	async selectFreePlan() {
		const freePlanSelector = By.css( 'button[data-e2e-button="freePlan"]' );
		await driverHelper.scrollIntoView( this.driver, freePlanSelector );
		return await driverHelper.clickWhenClickable( this.driver, freePlanSelector );
	}

	async getRecommendedPlan() {
		// Using the .has-badge selector to find the recommended plan
		const planNameSelector = By.css(
			'.plans-accordion-item.has-badge .plans-accordion-item__name'
		);
		const planName = await this.driver.findElement( planNameSelector );
		return await planName.getText();
	}
}
