/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

import * as driverHelper from '../driver-helper';
import * as driverManager from '../driver-manager';

export default class StatsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.stats-module' ) );
	}

	async _expandNavIfMobile() {
		if ( driverManager.currentScreenSize() !== 'mobile' ) {
			return await this.waitForPage();
		}
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav__mobile-header' )
		);
	}
}
