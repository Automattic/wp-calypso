/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper.js';
import AsyncBaseContainer from '../../async-base-container';

export default class UpsellPage extends AsyncBaseContainer {
	constructor( driver ) {
		super(
			driver,
			By.css(
				'.concierge-quickstart-session, .premium-plan-upgrade-upsell, .business-plan-upgrade-upsell'
			)
		);
	}

	async declineOffer() {
		const selector = By.css( 'button[data-e2e-button="decline"]' );
		await driverHelper.waitUntilLocatedAndVisible( this.driver, selector );
		// Sometimes the button is outside of the viewport which may be the reason behind intermittent failures.
		await driverHelper.scrollIntoView( this.driver, selector, 'center' );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}
}
