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
		return await driverHelper.isElementLocated(
			this.driver,
			By.css( '.plan-item__select-button.is-selected' )
		);
	}
	async expandAllPlans() {
		const toggleAllPlansLocator = By.css( 'button.plans-accordion__toggle-all-button' );
		await driverHelper.scrollIntoView( this.driver, toggleAllPlansLocator );
		return await driverHelper.clickWhenClickable( this.driver, toggleAllPlansLocator );
	}

	async selectFreePlan() {
		const freePlanLocator = By.css( 'button[data-e2e-button="freePlan"]' );
		await driverHelper.scrollIntoView( this.driver, freePlanLocator );
		return await driverHelper.clickWhenClickable( this.driver, freePlanLocator );
	}

	/**
	 * @returns {Promise<string>} the name of the plan that's being recommended
	 */
	async getRecommendedPlan() {
		// Using the .has-badge selector to find the recommended plan
		const planNameLocator = By.css( '.plans-accordion-item.has-badge .plans-accordion-item__name' );
		const planName = await this.driver.findElement( planNameLocator );
		return await planName.getText();
	}
}
