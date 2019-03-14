/** @format */

import { By } from 'selenium-webdriver';

import * as driverHelper from '../../driver-helper.js';
import AsyncBaseContainer from '../../async-base-container';

export default class UpsellPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.concierge-session-nudge' ) );
	}

	async declineOffer() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.concierge-session-nudge__decline-offer-button' )
		);
	}
}
