import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper.js';

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
		const premiumPlanCardLocator = By.css( '.plan-thank-you-card.is-premium-plan' );

		return await driverHelper.isElementLocated( this.driver, premiumPlanCardLocator );
	}
}
