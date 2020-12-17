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
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css(
				'.concierge-quickstart-session__decline-offer-button, .business-plan-upgrade-upsell__decline-offer-button, .premium-plan-upgrade-upsell__decline-offer-button'
			)
		);
	}
}
