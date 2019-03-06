/** @format */

import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';

import AsyncBaseContainer from '../../async-base-container';

export default class SiteInfoPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.site-information__wrapper' ) );
	}

	async enterSiteTitle( siteTitle ) {
		return await driverHelper.setWhenSettable( this.driver, By.css( '#title' ), siteTitle );
	}

	async submitForm() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.site-information__wrapper button.is-primary' )
		);
	}
}
