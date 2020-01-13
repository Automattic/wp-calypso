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
		super( driver, By.css( '.concierge-quickstart-session, .plan-upgrade-upsell' ) );
	}

	async declineOffer() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css(
				'.concierge-quickstart-session__decline-offer-button, .plan-upgrade-upsell__decline-offer-button'
			)
		);
	}
}
