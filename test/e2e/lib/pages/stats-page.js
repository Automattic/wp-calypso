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
import * as dataHelper from '../data-helper';

export default class StatsPage extends AsyncBaseContainer {
	constructor( driver, url = dataHelper.getCalypsoURL( 'stats/day' ) ) {
		super( driver, By.css( '.stats-module' ), url );
	}

	async openInsights() {
		await this._expandNavIfMobile();
		await driverHelper.clickWhenClickable( this.driver, By.css( '.stats-navigation__insights' ) );
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( '.stats__section-header' )
		);
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
