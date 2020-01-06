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
		super( driver, By.css( '.plan-upgrade-upsell' ) );
	}

	async declineOffer() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.plan-upgrade-upsell__decline-offer-button' )
		);
	}
}
