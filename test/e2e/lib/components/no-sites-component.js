/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';

export default class NoSitesComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.empty-content' ) );
	}

	async createSite() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.empty-content__action.button.is-primary' )
		);
	}
}
