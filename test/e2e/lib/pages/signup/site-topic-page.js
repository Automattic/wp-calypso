/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper.js';

import AsyncBaseContainer from '../../async-base-container';

export default class SiteTopicPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.site-topic__content' ) );
	}

	async enterSiteTopic( siteTopic ) {
		await driverHelper.setWhenSettable( this.driver, By.css( '#siteTopic' ), siteTopic );
		// click info popover icon to close the suggestion overlay
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.suggestions__item.has-highlight' )
		);
	}

	async submitForm() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.site-topic__content button.is-primary' )
		);
	}
}
