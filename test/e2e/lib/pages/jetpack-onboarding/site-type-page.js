/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';

import * as driverHelper from '../../driver-helper';

export default class SiteTypePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.steps__main[data-e2e-type="site-type"]' ) );
	}

	async selectPersonalSite() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a.card[data-e2e-type="personal"] button' )
		);
	}

	async selectBusinessSite() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a.card[data-e2e-type="business"] button' )
		);
	}
}
