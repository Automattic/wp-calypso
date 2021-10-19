import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper.js';

export default class UpsellPage extends AsyncBaseContainer {
	constructor( driver ) {
		super(
			driver,
			By.css(
				'.premium-plan-upgrade-upsell, .business-plan-upgrade-upsell'
			)
		);
	}

	async declineOffer() {
		const locator = By.css( 'button[data-e2e-button="decline"]' );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, locator );
		// Sometimes the button is outside of the viewport which may be the reason behind intermittent failures.
		await driverHelper.scrollIntoView( this.driver, locator, 'center' );
		return await driverHelper.clickWhenClickable( this.driver, locator );
	}
}
