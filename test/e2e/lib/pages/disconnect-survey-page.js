/** @format */

import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';

import * as DriverHelper from '../driver-helper.js';

export default class DisconnectSurveyPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.disconnect-site__survey' ) );
	}

	async skipSurvey() {
		await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.disconnect-site__navigation-links a[href*=confirm]' )
		);
		return await DriverHelper.isElementPresent( this.driver, By.css( '.is-primary.is-scary' ) );
	}

	async skipSurveyAndDisconnectSite() {
		await this.skipSurvey();
		await DriverHelper.clickWhenClickable( this.driver, By.css( '.is-primary.is-scary' ) );
		return await DriverHelper.isElementPresent( this.driver, By.css( '.notice.is-success' ) );
	}
}
