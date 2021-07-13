import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper.js';

export default class SiteTitlePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.site-title__wrapper' ) );
	}

	async enterSiteTitle( siteTitle ) {
		return await driverHelper.setWhenSettable( this.driver, By.css( '#title' ), siteTitle );
	}

	async submitForm() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.site-title__wrapper button.is-primary' )
		);
	}
}
