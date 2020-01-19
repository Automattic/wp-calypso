/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper.js';
import AsyncBaseContainer from '../../async-base-container';

export default class CheckOutThankyouPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.checkout-thank-you' ) );
	}

	async goToMyDomain() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.thank-you-card__button' )
		);
	}

	async isPremiumPlan() {
		const premiumPlanCardSelector = By.css( '.plan-thank-you-card.is-premium-plan' );

		return await driverHelper.isElementPresent( this.driver, premiumPlanCardSelector );
	}
}
